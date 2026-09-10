import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Solpay } from "../target/types/solpay";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("solpay", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Solpay as Program<Solpay>;

  const merchantOwner = Keypair.generate();
  const buyer = Keypair.generate();
  const treasury = Keypair.generate();
  const protocolTreasury = Keypair.generate();

  let merchantPDA: PublicKey;
  let merchantBump: number;
  let mint: PublicKey;
  let buyerAta: PublicKey;
  let merchantAta: PublicKey;

  before(async () => {
    // Airdrop to all parties
    for (const kp of [merchantOwner, buyer, treasury]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    }

    [merchantPDA, merchantBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), merchantOwner.publicKey.toBuffer()],
      program.programId
    );

    // Create a test SPL mint (simulating USDC)
    mint = await createMint(
      provider.connection,
      buyer,
      buyer.publicKey,
      null,
      6
    );

    buyerAta = await createAssociatedTokenAccount(
      provider.connection,
      buyer,
      mint,
      buyer.publicKey
    );

    merchantAta = await createAssociatedTokenAccount(
      provider.connection,
      buyer,
      mint,
      treasury.publicKey
    );

    // Mint 1000 USDC to buyer
    await mintTo(
      provider.connection,
      buyer,
      mint,
      buyerAta,
      buyer,
      1_000_000_000 // 1000 USDC (6 decimals)
    );
  });

  // ── Merchant registration ──────────────────────────────────────

  it("registers a merchant", async () => {
    await program.methods
      .registerMerchant("BrewNairobi", 50) // 0.5% fee
      .accounts({
        merchant: merchantPDA,
        owner: merchantOwner.publicKey,
        treasury: treasury.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([merchantOwner])
      .rpc();

    const account = await program.account.merchantAccount.fetch(merchantPDA);
    assert.equal(account.name, "BrewNairobi");
    assert.equal(account.feeBps, 50);
    assert.equal(account.owner.toString(), merchantOwner.publicKey.toString());
    assert.equal(account.treasury.toString(), treasury.publicKey.toString());
    assert.equal(account.txCount.toNumber(), 0);
    assert.equal(account.totalVolume.toNumber(), 0);
    console.log("✅ Merchant registered:", merchantPDA.toString());
  });

  it("rejects a fee over 10%", async () => {
    const badOwner = Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      badOwner.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    const [badPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), badOwner.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .registerMerchant("BadMerchant", 1001)
        .accounts({
          merchant: badPDA,
          owner: badOwner.publicKey,
          treasury: treasury.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([badOwner])
        .rpc();
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.include(e.message, "FeeTooHigh");
      console.log("✅ Fee guard works correctly");
    }
  });

  // ── SOL payment ───────────────────────────────────────────────

  it("processes a SOL payment and updates merchant stats", async () => {
    const amountLamports = new BN(0.1 * LAMPORTS_PER_SOL);
    const orderId = "order-001";

    const treasuryBefore = await provider.connection.getBalance(
      treasury.publicKey
    );

    await program.methods
      .paySol(amountLamports, orderId)
      .accounts({
        merchant: merchantPDA,
        buyer: buyer.publicKey,
        treasury: treasury.publicKey,
        protocolTreasury: protocolTreasury.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    const account = await program.account.merchantAccount.fetch(merchantPDA);
    assert.equal(account.txCount.toNumber(), 1);
    assert.equal(
      account.totalVolume.toNumber(),
      amountLamports.toNumber()
    );

    const treasuryAfter = await provider.connection.getBalance(
      treasury.publicKey
    );

    // Fee is 0.5% of 0.1 SOL = 0.0005 SOL
    // Net to treasury = 0.1 - 0.0005 = 0.0995 SOL
    const expectedNet = amountLamports.toNumber() * (1 - 50 / 10000);
    assert.approximately(
      treasuryAfter - treasuryBefore,
      expectedNet,
      1000 // 1000 lamport tolerance for rounding
    );
    console.log("✅ SOL payment processed, treasury received:", treasuryAfter - treasuryBefore, "lamports");
  });

  it("rejects a zero-amount SOL payment", async () => {
    try {
      await program.methods
        .paySol(new BN(0), "order-zero")
        .accounts({
          merchant: merchantPDA,
          buyer: buyer.publicKey,
          treasury: treasury.publicKey,
          protocolTreasury: protocolTreasury.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.include(e.message, "ZeroAmount");
      console.log("✅ Zero-amount guard works");
    }
  });

  // ── SPL token escrow ──────────────────────────────────────────

  it("creates a USDC escrow", async () => {
    const orderId = "usdc-order-001";
    const amount = new BN(10_000_000); // 10 USDC

    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        merchantPDA.toBuffer(),
        Buffer.from(orderId),
      ],
      program.programId
    );

    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), escrowPDA.toBuffer()],
      program.programId
    );

    await program.methods
      .createEscrow(amount, orderId)
      .accounts({
        escrow: escrowPDA,
        merchant: merchantPDA,
        buyer: buyer.publicKey,
        mint,
        buyerAta,
        escrowVault: vaultPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([buyer])
      .rpc();

    const escrow = await program.account.escrowAccount.fetch(escrowPDA);
    assert.equal(escrow.amount.toNumber(), amount.toNumber());
    assert.equal(escrow.released, false);
    assert.equal(escrow.refunded, false);
    assert.equal(escrow.orderId, orderId);
    console.log("✅ Escrow created:", escrowPDA.toString());
  });

  it("releases escrow to merchant", async () => {
    const orderId = "usdc-order-002";
    const amount = new BN(5_000_000); // 5 USDC

    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), merchantPDA.toBuffer(), Buffer.from(orderId)],
      program.programId
    );
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), escrowPDA.toBuffer()],
      program.programId
    );

    // Create the escrow first
    await program.methods
      .createEscrow(amount, orderId)
      .accounts({
        escrow: escrowPDA,
        merchant: merchantPDA,
        buyer: buyer.publicKey,
        mint,
        buyerAta,
        escrowVault: vaultPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([buyer])
      .rpc();

    // Now release it
    await program.methods
      .releaseEscrow()
      .accounts({
        escrow: escrowPDA,
        merchant: merchantPDA,
        merchantOwner: merchantOwner.publicKey,
        escrowVault: vaultPDA,
        merchantAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([merchantOwner])
      .rpc();

    const escrow = await program.account.escrowAccount.fetch(escrowPDA);
    assert.equal(escrow.released, true);
    console.log("✅ Escrow released to merchant");
  });

  it("prevents double-release of escrow", async () => {
    const orderId = "usdc-order-002"; // already released above
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), merchantPDA.toBuffer(), Buffer.from(orderId)],
      program.programId
    );
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), escrowPDA.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .releaseEscrow()
        .accounts({
          escrow: escrowPDA,
          merchant: merchantPDA,
          merchantOwner: merchantOwner.publicKey,
          escrowVault: vaultPDA,
          merchantAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([merchantOwner])
        .rpc();
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.include(e.message, "AlreadyReleased");
      console.log("✅ Double-release prevention works");
    }
  });

  it("prevents unauthorized escrow release", async () => {
    const orderId = "usdc-order-003";
    const amount = new BN(2_000_000);
    const attacker = Keypair.generate();

    const sig = await provider.connection.requestAirdrop(
      attacker.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), merchantPDA.toBuffer(), Buffer.from(orderId)],
      program.programId
    );
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), escrowPDA.toBuffer()],
      program.programId
    );

    await program.methods
      .createEscrow(amount, orderId)
      .accounts({
        escrow: escrowPDA,
        merchant: merchantPDA,
        buyer: buyer.publicKey,
        mint,
        buyerAta,
        escrowVault: vaultPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([buyer])
      .rpc();

    try {
      await program.methods
        .releaseEscrow()
        .accounts({
          escrow: escrowPDA,
          merchant: merchantPDA,
          merchantOwner: attacker.publicKey,
          escrowVault: vaultPDA,
          merchantAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([attacker])
        .rpc();
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.include(e.message, "Unauthorized");
      console.log("✅ Unauthorized release blocked");
    }
  });
});
