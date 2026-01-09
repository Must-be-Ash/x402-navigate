'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, GraduationCap, MessageSquare, Github, LogIn } from 'lucide-react';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { SignInModal } from '@coinbase/cdp-react';
import { WalletDropdown } from '@/components/WalletDropdown';
import { ExplosionCanvas, ExplosionCanvasRef } from './explosion-canvas';

interface NavDockProps {
  rightContent?: ReactNode;
  showSignIn?: boolean; // If true, show Sign In instead of GitHub
}

export function NavDock({ rightContent, showSignIn = false }: NavDockProps = {}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [canTrigger, setCanTrigger] = useState(true);
  const explosionCanvasRef = useRef<ExplosionCanvasRef>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isSignedIn } = useIsSignedIn();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Mobile classes change based on scroll state
  const linkClass = isScrolled
    ? 'px-3 py-2 sm:px-3 sm:py-1.5'
    : 'px-4 py-3 sm:px-3 sm:py-1.5';
  const iconClass = isScrolled
    ? 'h-5 w-5 sm:h-4 sm:w-4'
    : 'h-6 w-6 sm:h-4 sm:w-4';
  const containerPadding = isScrolled
    ? 'p-1 sm:p-1'
    : 'p-1.5 sm:p-1';

  const navItems = [
    { path: '/', icon: Search, label: 'Search', isActive: isActive('/') },
    { path: '/learn', icon: GraduationCap, label: 'Learn', isActive: isActive('/learn') },
    { path: '/chat', icon: MessageSquare, label: 'Chat', isActive: isActive('/chat') },
  ];

  return (
    <>
      <header className={`border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40 transition-all duration-200 ${isScrolled ? 'py-0' : ''}`}>
        <div className={`container mx-auto px-4 transition-all duration-200 ${isScrolled ? 'py-2 sm:py-3' : 'py-3'}`}>
          <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={(e) => {
              if (!canTrigger) return;

              const rect = e.currentTarget.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;

              // Trigger explosion on canvas
              explosionCanvasRef.current?.explode(x, y);

              setIsGlitching(true);
              setCanTrigger(false);

              // Very short cooldown - 300ms (canvas is lightweight!)
              setTimeout(() => {
                setCanTrigger(true);
              }, 300);

              // Shorter glitch for rapid clicking
              setTimeout(() => setIsGlitching(false), 500);

              // Play sound effect - only if not already playing
              if (!audioRef.current || audioRef.current.paused || audioRef.current.ended) {
                audioRef.current = new Audio('/402.mp3');
                audioRef.current.volume = 0.5;
                audioRef.current.play().catch(err => console.log('Audio play failed:', err));
              }
            }}
            className="hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded relative cursor-pointer"
          >
            <span
              className={`glitch-text font-[family-name:var(--font-jersey-25)] text-foreground tracking-tight transition-all duration-200 ${isScrolled ? 'text-2xl sm:text-3xl' : 'text-3xl'} ${isGlitching ? 'glitching' : ''}`}
              data-text="x402"
            >
              x402
            </span>
          </button>
          <style jsx>{`
            .glitch-text {
              position: relative;
              display: inline-block;
            }

            .glitch-text.glitching {
              animation: glitch-skew 0.8s infinite;
            }

            .glitch-text.glitching::before,
            .glitch-text.glitching::after {
              content: attr(data-text);
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }

            .glitch-text.glitching::before {
              animation: glitch-anim-1 0.8s infinite;
              color: #ff00ff;
              z-index: -1;
            }

            .glitch-text.glitching::after {
              animation: glitch-anim-2 0.8s infinite;
              color: #00ffff;
              z-index: -2;
            }

            @keyframes glitch-skew {
              0% {
                transform: skew(0deg);
                filter: blur(0px);
              }
              10% {
                transform: skew(-5deg) translate(-8px, 2px);
                filter: blur(0px);
              }
              15% {
                transform: skew(5deg) translate(8px, -2px);
                filter: blur(1px);
              }
              20% {
                transform: skew(-3deg) translate(-4px, 1px);
                filter: blur(0px);
              }
              25% {
                transform: skew(2deg) translate(6px, -3px);
                filter: blur(1px);
              }
              30% {
                transform: skew(-4deg) translate(-7px, 2px);
                filter: blur(0px);
              }
              35% {
                transform: skew(0deg);
                filter: blur(0px);
              }
              40% {
                transform: skew(-2deg) translate(5px, -1px);
                filter: blur(1px);
              }
              45% {
                transform: skew(3deg) translate(-6px, 2px);
                filter: blur(0px);
              }
              50% {
                transform: skew(0deg);
                filter: blur(0px);
              }
              55% {
                transform: skew(-5deg) translate(7px, -2px);
                filter: blur(1px);
              }
              60% {
                transform: skew(4deg) translate(-5px, 3px);
                filter: blur(0px);
              }
              65% {
                transform: skew(-2deg) translate(4px, -1px);
                filter: blur(0px);
              }
              70% {
                transform: skew(0deg);
                filter: blur(1px);
              }
              75% {
                transform: skew(-3deg) translate(-6px, 2px);
                filter: blur(0px);
              }
              80% {
                transform: skew(2deg) translate(5px, -2px);
                filter: blur(0px);
              }
              85% {
                transform: skew(0deg);
                filter: blur(1px);
              }
              90% {
                transform: skew(-1deg) translate(-3px, 1px);
                filter: blur(0px);
              }
              95%, 100% {
                transform: skew(0deg);
                filter: blur(0px);
              }
            }

            @keyframes glitch-anim-1 {
              0% {
                clip-path: inset(40% 0 30% 0);
                transform: translate(0);
              }
              10% {
                clip-path: inset(92% 0 1% 0);
                transform: translate(-10px, 5px);
              }
              20% {
                clip-path: inset(43% 0 1% 0);
                transform: translate(10px, -5px);
              }
              30% {
                clip-path: inset(25% 0 58% 0);
                transform: translate(-8px, 3px);
              }
              40% {
                clip-path: inset(54% 0 7% 0);
                transform: translate(12px, -4px);
              }
              50% {
                clip-path: inset(58% 0 25% 0);
                transform: translate(-7px, 6px);
              }
              60% {
                clip-path: inset(13% 0 80% 0);
                transform: translate(9px, -3px);
              }
              70% {
                clip-path: inset(31% 0 50% 0);
                transform: translate(-11px, 4px);
              }
              80% {
                clip-path: inset(76% 0 20% 0);
                transform: translate(8px, -5px);
              }
              90% {
                clip-path: inset(20% 0 43% 0);
                transform: translate(-6px, 2px);
              }
              100% {
                clip-path: inset(40% 0 30% 0);
                transform: translate(0);
              }
            }

            @keyframes glitch-anim-2 {
              0% {
                clip-path: inset(65% 0 20% 0);
                transform: translate(0);
              }
              10% {
                clip-path: inset(10% 0 50% 0);
                transform: translate(8px, -4px);
              }
              20% {
                clip-path: inset(70% 0 15% 0);
                transform: translate(-12px, 6px);
              }
              30% {
                clip-path: inset(5% 0 80% 0);
                transform: translate(10px, -3px);
              }
              40% {
                clip-path: inset(35% 0 40% 0);
                transform: translate(-9px, 5px);
              }
              50% {
                clip-path: inset(80% 0 10% 0);
                transform: translate(11px, -6px);
              }
              60% {
                clip-path: inset(45% 0 30% 0);
                transform: translate(-7px, 4px);
              }
              70% {
                clip-path: inset(15% 0 70% 0);
                transform: translate(13px, -5px);
              }
              80% {
                clip-path: inset(60% 0 25% 0);
                transform: translate(-10px, 3px);
              }
              90% {
                clip-path: inset(30% 0 55% 0);
                transform: translate(6px, -2px);
              }
              100% {
                clip-path: inset(65% 0 20% 0);
                transform: translate(0);
              }
            }
          `}</style>

          {/* Navigation Dock + Optional Right Content */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center">
              <LayoutGroup id="nav-dock">
                <div className={`relative flex items-center gap-1 rounded-full bg-muted/50 border border-border/50 transition-all duration-200 ${containerPadding}`}>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`relative z-10 inline-flex items-center justify-center gap-1.5 ${linkClass} rounded-full text-sm font-medium transition-colors duration-200 ${item.isActive
                          ? 'text-white'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          }`}
                      >
                        {item.isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute inset-0 rounded-full bg-gradient-to-b from-[#555555] to-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] -z-10"
                            initial={false}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <Icon className={`${iconClass} transition-all duration-200`} />
                        <span className="hidden sm:inline">{item.label}</span>
                      </Link>
                    );
                  })}
                  {/* Fourth item: GitHub or Sign In based on showSignIn prop */}
                  {showSignIn ? (
                    isSignedIn ? (
                      <WalletDropdown
                        className={`relative z-10 inline-flex items-center justify-center gap-1.5 ${linkClass} rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all`}
                        iconClassName={iconClass}
                      />
                    ) : (
                      <SignInModal>
                        <button
                          className={`relative z-10 inline-flex items-center justify-center gap-1.5 ${linkClass} rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all`}
                        >
                          <LogIn className={`${iconClass} transition-all duration-200`} />
                          <span className="hidden sm:inline">Sign In</span>
                        </button>
                      </SignInModal>
                    )
                  ) : (
                    <a
                      href="https://github.com/coinbase/x402"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative z-10 inline-flex items-center justify-center gap-1.5 ${linkClass} rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all`}
                    >
                      <Github className={`${iconClass} transition-all duration-200`} />
                      <span className="hidden sm:inline">GitHub</span>
                    </a>
                  )}
                </div>
              </LayoutGroup>
            </nav>
            {rightContent}
          </div>
        </div>
      </div>
      </header>

      {/* Persistent canvas for all explosions */}
      <ExplosionCanvas ref={explosionCanvasRef} />
    </>
  );
}
