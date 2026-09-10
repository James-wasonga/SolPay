use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

// declare_id!("Fo8n6GUdix5GBEqUDZcGgFsvhDxpUnKmRogJyEsP32BR");
declare_id!("GKXVHCJUVEAWvgchwyA6aqZtTyo7zqeuftwNYGjMzRuE");


/// SolPay on-chain program
/// Handles:
///   1. Merchant registration (name, fee_bps, treasury wallet)
///   2. Direct SOL payments (with optional protocol fee)
///   3. SPL token payment escrow (USDC / BONK)
///   4. Escrow release after merchant confirmation
#[program]
pub mod solpay {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // Merchant Registry
    // ─────────────────────────────────────────────────────────────

    /// Register a new merchant. The signer becomes the owner.
    pub fn register_merchant(
        ctx: Context<RegisterMerchant>,
        name: String,
        fee_bps: u16, // protocol fee in basis points (e.g. 50 = 0.5%)
    ) -> Result<()> {
        require!(name.len() <= 64, SolPayError::NameTooLong);
        require!(fee_bps <= 1000, SolPayError::FeeTooHigh); // max 10%

        let merchant = &mut ctx.accounts.merchant;
        merchant.owner        = ctx.accounts.owner.key();
        merchant.treasury     = ctx.accounts.treasury.key();
        merchant.name         = name;
        merchant.fee_bps      = fee_bps;
        merchant.total_volume = 0;
        merchant.tx_count     = 0;
        merchant.bump         = ctx.bumps.merchant;
        Ok(())
    }

    /// Update merchant treasury wallet or fee.
    pub fn update_merchant(
        ctx: Context<UpdateMerchant>,
        fee_bps: Option<u16>,
    ) -> Result<()> {
        let merchant = &mut ctx.accounts.merchant;
        require!(
            merchant.owner == ctx.accounts.owner.key(),
            SolPayError::Unauthorized
        );
        if let Some(f) = fee_bps {
            require!(f <= 1000, SolPayError::FeeTooHigh);
            merchant.fee_bps = f;
        }
        merchant.treasury = ctx.accounts.new_treasury.key();
        Ok(())
    }

    // ─────────────────────────────────────────────────────────────
    // Direct SOL payment (instant, no escrow)
    // ─────────────────────────────────────────────────────────────

    /// Pay a merchant in native SOL.
    /// Splits a protocol fee to the protocol treasury and records stats on-chain.
    pub fn pay_sol(
        ctx: Context<PaySol>,
        amount_lamports: u64,
        order_id: String,
    ) -> Result<()> {
        require!(amount_lamports > 0, SolPayError::ZeroAmount);
        require!(order_id.len() <= 32, SolPayError::OrderIdTooLong);

        let merchant = &mut ctx.accounts.merchant;

        let fee_lamports = (amount_lamports as u128)
            .checked_mul(merchant.fee_bps as u128)
            .unwrap()
            .checked_div(10_000)
            .unwrap() as u64;

        let net_lamports = amount_lamports
            .checked_sub(fee_lamports)
            .unwrap();

        // Transfer net amount to merchant treasury
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to:   ctx.accounts.treasury.to_account_info(),
                },
            ),
            net_lamports,
        )?;

        // Transfer protocol fee (if any)
        if fee_lamports > 0 {
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.buyer.to_account_info(),
                        to:   ctx.accounts.protocol_treasury.to_account_info(),
                    },
                ),
                fee_lamports,
            )?;
        }

        // Update merchant stats
        merchant.total_volume = merchant.total_volume.saturating_add(amount_lamports);
        merchant.tx_count     = merchant.tx_count.saturating_add(1);

        // Emit event for indexers / dashboards
        emit!(PaymentEvent {
            merchant:  merchant.key(),
            buyer:     ctx.accounts.buyer.key(),
            amount:    amount_lamports,
            token:     "SOL".to_string(),
            order_id,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // ─────────────────────────────────────────────────────────────
    // SPL Token escrow (USDC / BONK)
    // ─────────────────────────────────────────────────────────────

    /// Buyer deposits SPL tokens into a PDA escrow vault.
    /// Merchant must call release_escrow to claim them.
    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        amount: u64,
        order_id: String,
    ) -> Result<()> {
        require!(amount > 0, SolPayError::ZeroAmount);
        require!(order_id.len() <= 32, SolPayError::OrderIdTooLong);

        let escrow = &mut ctx.accounts.escrow;
        escrow.merchant   = ctx.accounts.merchant.key();
        escrow.buyer      = ctx.accounts.buyer.key();
        escrow.mint       = ctx.accounts.mint.key();
        escrow.amount     = amount;
        escrow.order_id   = order_id.clone();
        escrow.released   = false;
        escrow.refunded   = false;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.bump       = ctx.bumps.escrow;

        // Move tokens from buyer ATA → escrow vault PDA
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.buyer_ata.to_account_info(),
                    to:        ctx.accounts.escrow_vault.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            amount,
        )?;

        emit!(EscrowCreatedEvent {
            escrow:    escrow.key(),
            merchant:  escrow.merchant,
            buyer:     escrow.buyer,
            amount,
            order_id,
            timestamp: escrow.created_at,
        });

        Ok(())
    }

    /// Merchant releases escrow → tokens sent to merchant treasury ATA.
    pub fn release_escrow(ctx: Context<ReleaseEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.released, SolPayError::AlreadyReleased);
        require!(!escrow.refunded, SolPayError::AlreadyRefunded);
        require!(
            ctx.accounts.merchant_owner.key() == ctx.accounts.merchant.owner,
            SolPayError::Unauthorized
        );

        escrow.released = true;

        let merchant_key = escrow.merchant;
        let order_id = escrow.order_id.clone();
        let bump = escrow.bump;
        let amount = escrow.amount;

        let seeds: &[&[&[u8]]] = &[&[
            b"escrow",
            merchant_key.as_ref(),
            order_id.as_bytes(),
            &[bump],
        ]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.escrow_vault.to_account_info(),
                    to:        ctx.accounts.merchant_ata.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
                seeds,
            ),
            amount,
        )?;

        Ok(())
    }

    /// Buyer can refund their escrow if merchant has not released within 7 days.
    pub fn refund_escrow(ctx: Context<RefundEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.released, SolPayError::AlreadyReleased);
        require!(!escrow.refunded, SolPayError::AlreadyRefunded);

        let now = Clock::get()?.unix_timestamp;
        require!(
            now - escrow.created_at > 7 * 24 * 3600,
            SolPayError::RefundWindowNotOpen
        );

        escrow.refunded = true;

        let merchant_key = escrow.merchant;
        let order_id = escrow.order_id.clone();
        let bump = escrow.bump;
        let amount = escrow.amount;

        let seeds: &[&[&[u8]]] = &[&[
            b"escrow",
            merchant_key.as_ref(),
            order_id.as_bytes(),
            &[bump],
        ]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:      ctx.accounts.escrow_vault.to_account_info(),
                    to:        ctx.accounts.buyer_ata.to_account_info(),
                    authority: ctx.accounts.escrow.to_account_info(),
                },
                seeds,
            ),
            amount,
        )?;

        Ok(())
    }

}

// ─────────────────────────────────────────────────────────────────
// Account contexts
// ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterMerchant<'info> {
    #[account(
        init,
        payer  = owner,
        space  = MerchantAccount::LEN,
        seeds  = [b"merchant", owner.key().as_ref()],
        bump
    )]
    pub merchant:       Account<'info, MerchantAccount>,
    #[account(mut)]
    pub owner:          Signer<'info>,
    /// CHECK: stored as treasury pubkey only — not read or written
    pub treasury:       UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMerchant<'info> {
    #[account(
        mut,
        seeds = [b"merchant", owner.key().as_ref()],
        bump  = merchant.bump
    )]
    pub merchant:     Account<'info, MerchantAccount>,
    pub owner:        Signer<'info>,
    /// CHECK: new treasury — validated via merchant owner check
    pub new_treasury: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(amount_lamports: u64, order_id: String)]
pub struct PaySol<'info> {
    #[account(
        mut,
        seeds = [b"merchant", merchant.owner.as_ref()],
        bump  = merchant.bump
    )]
    pub merchant:          Account<'info, MerchantAccount>,
    #[account(mut)]
    pub buyer:             Signer<'info>,
    /// CHECK: validated via merchant.treasury field
    #[account(mut, address = merchant.treasury)]
    pub treasury:          UncheckedAccount<'info>,
    /// CHECK: protocol treasury — receives fee_bps cut
    #[account(mut)]
    pub protocol_treasury: UncheckedAccount<'info>,
    pub system_program:    Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, order_id: String)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer  = buyer,
        space  = EscrowAccount::LEN,
        seeds  = [b"escrow", merchant.key().as_ref(), order_id.as_bytes()],
        bump
    )]
    pub escrow:         Account<'info, EscrowAccount>,
    #[account(
        seeds = [b"merchant", merchant.owner.as_ref()],
        bump  = merchant.bump
    )]
    pub merchant:       Account<'info, MerchantAccount>,
    #[account(mut)]
    pub buyer:          Signer<'info>,
    pub mint:           Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub buyer_ata:      Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer            = buyer,
        token::mint      = mint,
        token::authority = escrow,
        seeds            = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault:   Account<'info, TokenAccount>,
    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent:           Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", merchant.key().as_ref(), escrow.order_id.as_bytes()],
        bump  = escrow.bump
    )]
    pub escrow:         Account<'info, EscrowAccount>,
    #[account(
        seeds = [b"merchant", merchant_owner.key().as_ref()],
        bump  = merchant.bump
    )]
    pub merchant:       Account<'info, MerchantAccount>,
    pub merchant_owner: Signer<'info>,
    #[account(mut)]
    pub escrow_vault:   Account<'info, TokenAccount>,
    #[account(mut)]
    pub merchant_ata:   Account<'info, TokenAccount>,
    pub token_program:  Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.merchant.as_ref(), escrow.order_id.as_bytes()],
        bump  = escrow.bump
    )]
    pub escrow:        Account<'info, EscrowAccount>,
    pub buyer:         Signer<'info>,
    #[account(mut)]
    pub escrow_vault:  Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_ata:     Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// ─────────────────────────────────────────────────────────────────
// Data account types
// ─────────────────────────────────────────────────────────────────

#[account]
pub struct MerchantAccount {
    pub owner:        Pubkey, // 32
    pub treasury:     Pubkey, // 32
    pub name:         String, // 4 + 64
    pub fee_bps:      u16,    // 2
    pub total_volume: u64,    // 8
    pub tx_count:     u64,    // 8
    pub bump:         u8,     // 1
}

impl MerchantAccount {
    pub const LEN: usize = 8 + 32 + 32 + (4 + 64) + 2 + 8 + 8 + 1;
}

#[account]
pub struct EscrowAccount {
    pub merchant:   Pubkey, // 32
    pub buyer:      Pubkey, // 32
    pub mint:       Pubkey, // 32
    pub amount:     u64,    // 8
    pub order_id:   String, // 4 + 32
    pub released:   bool,   // 1
    pub refunded:   bool,   // 1
    pub created_at: i64,    // 8
    pub bump:       u8,     // 1
}

impl EscrowAccount {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + (4 + 32) + 1 + 1 + 8 + 1;
}

// ─────────────────────────────────────────────────────────────────
// Events (emitted on-chain, readable by indexers)
// ─────────────────────────────────────────────────────────────────

#[event]
pub struct PaymentEvent {
    pub merchant:  Pubkey,
    pub buyer:     Pubkey,
    pub amount:    u64,
    pub token:     String,
    pub order_id:  String,
    pub timestamp: i64,
}

#[event]
pub struct EscrowCreatedEvent {
    pub escrow:    Pubkey,
    pub merchant:  Pubkey,
    pub buyer:     Pubkey,
    pub amount:    u64,
    pub order_id:  String,
    pub timestamp: i64,
}

// ─────────────────────────────────────────────────────────────────
// Custom errors
// ─────────────────────────────────────────────────────────────────

#[error_code]
pub enum SolPayError {
    #[msg("Name exceeds 64 characters")]
    NameTooLong,
    #[msg("Fee basis points exceed 1000 (10%)")]
    FeeTooHigh,
    #[msg("Unauthorised: signer is not the merchant owner")]
    Unauthorized,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Order ID exceeds 32 characters")]
    OrderIdTooLong,
    #[msg("Escrow has already been released")]
    AlreadyReleased,
    #[msg("Escrow has already been refunded")]
    AlreadyRefunded,
    #[msg("Refund window not open — 7 days must pass first")]
    RefundWindowNotOpen,
}