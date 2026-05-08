// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useWalletModal } from '@solana/wallet-adapter-react-ui';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { shortenAddress } from '@/lib/solana';

// export function Navbar() {
//   const { connected, publicKey, disconnect } = useWallet();
//   const { setVisible } = useWalletModal();
//   const pathname = usePathname();

//   const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/demo', label: 'Live Demo' },
//     { href: '/dashboard', label: 'Dashboard' },
//     { href: '/docs', label: 'Docs' },
//   ];

//   const isActive = (href: string) =>
//     href === '/' ? pathname === '/' : pathname.startsWith(href);

//   return (
//     <nav
//       className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
//       style={{
//         background: 'rgba(8,12,20,0.8)',
//         backdropFilter: 'blur(20px)',
//         borderBottom: '1px solid rgba(26,34,53,0.8)',
//       }}
//     >
//       {/* Logo */}
//       <Link href="/" className="flex items-center gap-2 group">
//         <div
//           className="w-8 h-8 rounded-xl flex items-center justify-center"
//           style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }}
//         >
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//             <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/>
//             <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
//           </svg>
//         </div>
//         <span
//           className="font-black text-xl tracking-tight"
//           style={{ fontFamily: 'var(--font-display)' }}
//         >
//           Sol<span className="gradient-text-purple">Pay</span>
//         </span>
//       </Link>

//       {/* Nav links */}
//       <div className="hidden md:flex items-center gap-1">
//         {navLinks.map(({ href, label }) => {
//           const active = isActive(href);
//           return (
//             <Link
//               key={href}
//               href={href}
//               className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
//               style={{
//                 color: active ? '#ffffff' : 'var(--sol-muted)',
//                 background: active ? 'rgba(153,69,255,0.12)' : 'transparent',
//               }}
//             >
//               {label}
//               {/* Active underbar */}
//               {active && (
//                 <span
//                   className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
//                   style={{
//                     width: '60%',
//                     height: '2px',
//                     background: 'linear-gradient(90deg, #9945FF, #14F195)',
//                     display: 'block',
//                   }}
//                 />
//               )}
//             </Link>
//           );
//         })}
//       </div>

//       {/* Wallet */}
//       <div className="flex items-center gap-3">
//         {connected && publicKey ? (
//           <div className="flex items-center gap-2">
//             <div
//               className="px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2"
//               style={{
//                 background: 'rgba(20,241,149,0.1)',
//                 border: '1px solid rgba(20,241,149,0.2)',
//                 color: '#14F195',
//               }}
//             >
//               <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
//               {shortenAddress(publicKey.toString())}
//             </div>
//             <button
//               onClick={disconnect}
//               className="btn-secondary text-xs px-3 py-2 rounded-xl"
//             >
//               Disconnect
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={() => setVisible(true)}
//             className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold"
//           >
//             Connect Wallet
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress } from '@/lib/solana';

const NAV_LINKS = [
  { href: '/',          label: 'Home',      icon: '🏠' },
  { href: '/demo',      label: 'Live Demo', icon: '⚡' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/docs',      label: 'Docs',      icon: '📖' },
];

export function Navbar() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Main bar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5"
        style={{
          background: 'rgba(8,12,20,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(26,34,53,0.9)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-black text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Sol<span className="gradient-text-purple">Pay</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? '#ffffff' : 'var(--sol-muted)',
                  background: active ? 'rgba(153,69,255,0.12)' : 'transparent',
                }}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: '60%', height: '2px',
                      background: 'linear-gradient(90deg, #9945FF, #14F195)',
                      display: 'block',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop wallet */}
        <div className="hidden md:flex items-center gap-3">
          {connected && publicKey ? (
            <div className="flex items-center gap-2">
              <div
                className="px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2"
                style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.2)', color: '#14F195' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {shortenAddress(publicKey.toString())}
              </div>
              <button onClick={disconnect} className="btn-secondary text-xs px-3 py-2 rounded-xl">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={() => setVisible(true)} className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold">
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile right side: wallet badge + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {connected && publicKey && (
            <div
              className="px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5"
              style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.2)', color: '#14F195' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {shortenAddress(publicKey.toString(), 3)}
            </div>
          )}

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 flex-shrink-0"
            style={{
              background: menuOpen ? 'rgba(153,69,255,0.2)' : 'rgba(26,34,53,0.8)',
              border: `1px solid ${menuOpen ? 'rgba(153,69,255,0.5)' : 'rgba(26,34,53,0.9)'}`,
            }}
            aria-label="Toggle menu"
          >
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: 18, height: 2,
                background: menuOpen ? '#9945FF' : 'var(--sol-text)',
                transform: menuOpen ? 'translateY(5.5px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: 18, height: 2,
                background: menuOpen ? '#9945FF' : 'var(--sol-text)',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: 18, height: 2,
                background: menuOpen ? '#9945FF' : 'var(--sol-text)',
                transform: menuOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile slide-down menu ── */}
      <div
        className="fixed left-0 right-0 z-40 md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          top: 57,
          maxHeight: menuOpen ? 420 : 0,
          opacity: menuOpen ? 1 : 0,
          background: 'rgba(8,12,20,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: menuOpen ? '1px solid rgba(153,69,255,0.25)' : 'none',
        }}
      >
        <div className="px-4 pt-4 pb-5 space-y-2">
          {/* Nav links */}
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? 'rgba(153,69,255,0.15)' : 'rgba(26,34,53,0.5)',
                  color: active ? '#ffffff' : 'var(--sol-muted)',
                  border: `1px solid ${active ? 'rgba(153,69,255,0.35)' : 'rgba(26,34,53,0.8)'}`,
                }}
              >
                <span className="text-base w-6 flex-shrink-0">{icon}</span>
                <span className="flex-1">{label}</span>
                {active && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }}
                  />
                )}
                {!active && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="pt-1 pb-1" style={{ borderTop: '1px solid rgba(26,34,53,0.8)' }} />

          {/* Wallet section */}
          {connected && publicKey ? (
            <div className="space-y-2">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.2)' }}
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: 'var(--sol-muted)' }}>Connected wallet</p>
                  <p className="text-sm font-mono truncate" style={{ color: '#14F195' }}>
                    {publicKey.toString().slice(0, 16)}...{publicKey.toString().slice(-8)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { disconnect(); setMenuOpen(false); }}
                className="w-full py-3 rounded-2xl text-sm font-semibold btn-secondary"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setVisible(true); setMenuOpen(false); }}
              className="w-full py-3.5 rounded-2xl text-sm font-bold btn-primary"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* ── Tap-outside backdrop ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.4)', top: 57 }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

