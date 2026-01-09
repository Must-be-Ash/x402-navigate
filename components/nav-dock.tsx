'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, GraduationCap, MessageSquare, Github, Wallet, LogOut } from 'lucide-react';
import { ReactNode } from 'react';
import { useIsSignedIn, useSignOut } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react';
import { WalletDropdown } from '@/components/WalletDropdown';

interface NavDockProps {
  rightContent?: ReactNode;
}

export function NavDock({ rightContent }: NavDockProps = {}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="font-[family-name:var(--font-jersey-25)] text-3xl text-foreground tracking-tight">
              x402
            </span>
          </Link>

          {/* Navigation Dock + Optional Right Content */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center">
              <div className="flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/50">
                <Link
                  href="/"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </Link>
                <Link
                  href="/learn"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/learn')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Learn</span>
                </Link>
                <Link
                  href="/chat"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/chat')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Link>
                <a
                  href="https://github.com/coinbase/x402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all"
                >
                  <Github className="h-4 w-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>
            </nav>
            {rightContent}
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileNavDock() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 sm:hidden flex justify-center px-4">
      <nav className="flex items-center gap-1 px-2 py-2 rounded-2xl bg-background/90 backdrop-blur-md border border-border/50 shadow-lg">
        <Link
          href="/"
          className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${isActive('/')
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          <Search className="h-5 w-5" />
        </Link>
        <Link
          href="/learn"
          className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${isActive('/learn')
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          <GraduationCap className="h-5 w-5" />
        </Link>
        <Link
          href="/chat"
          className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${isActive('/chat')
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          <MessageSquare className="h-5 w-5" />
        </Link>
        <a
          href="https://github.com/coinbase/x402"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <Github className="h-5 w-5" />
        </a>
      </nav>
    </div>
  );
}

// Chat-specific NavDock with Sign In button instead of GitHub
export function ChatNavDock() {
  const pathname = usePathname();
  const { isSignedIn } = useIsSignedIn();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="font-[family-name:var(--font-jersey-25)] text-3xl text-foreground tracking-tight">
              x402
            </span>
          </Link>

          {/* Navigation Dock with Sign In / Wallet */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center">
              <div className="flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/50">
                <Link
                  href="/"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </Link>
                <Link
                  href="/learn"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/learn')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Learn</span>
                </Link>
                <Link
                  href="/chat"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/chat')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Link>

                {/* Sign In Button (only when not signed in) */}
                {!isSignedIn && (
                  <div className="[&_button]:!inline-flex [&_button]:!items-center [&_button]:!gap-1.5 [&_button]:!rounded-full [&_button]:!px-3 [&_button]:!py-1 [&_button]:!text-sm [&_button]:!font-medium [&_button]:!border-0 [&_button]:!shadow-none [&_button]:hover:!opacity-90 [&_button]:!h-[30px] [&_button]:!min-w-0 [&_button]:!min-h-0 [&_button]:!leading-none">
                    <AuthButton />
                  </div>
                )}
              </div>
            </nav>

            {/* Wallet Dropdown (only when signed in) */}
            {isSignedIn && <WalletDropdown />}
          </div>
        </div>
      </div>
    </header>
  );
}

// Chat-specific Mobile NavDock with Sign In button instead of GitHub
export function ChatMobileNavDock() {
  const pathname = usePathname();
  const { isSignedIn } = useIsSignedIn();
  const { signOut } = useSignOut();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 sm:hidden flex justify-center px-4">
      <nav className="flex items-center gap-1 px-2 py-2 rounded-2xl bg-background/90 backdrop-blur-md border border-border/50 shadow-lg">
        <Link
          href="/"
          className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${isActive('/')
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          <Search className="h-5 w-5" />
        </Link>
        <Link
          href="/learn"
          className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${isActive('/learn')
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          <GraduationCap className="h-5 w-5" />
        </Link>
        <Link
          href="/chat"
          className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${isActive('/chat')
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          <MessageSquare className="h-5 w-5" />
        </Link>

        {/* Sign In / Wallet Button */}
        {isSignedIn ? (
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center w-12 h-10 rounded-xl bg-foreground text-background transition-all"
            title="Sign out"
          >
            <Wallet className="h-5 w-5" />
          </button>
        ) : (
          <div className="[&>button]:!flex [&>button]:!items-center [&>button]:!justify-center [&>button]:!w-12 [&>button]:!h-10 [&>button]:!rounded-xl [&>button]:!p-0 [&>button]:!border-0 [&>button]:!shadow-none [&>button]:!min-w-0 [&>button]:!min-h-0 [&>button>span]:!hidden [&>button>svg]:!w-5 [&>button>svg]:!h-5">
            <AuthButton />
          </div>
        )}
      </nav>
    </div>
  );
}
