'use client';

import Link from 'next/link';
import { Wallet, Server, Network, ArrowRight, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavDock, MobileNavDock } from '@/components/nav-dock';

interface ProgressData {
  client: number[];
  server: number[];
  facilitator: number[];
}

export default function LearnPage() {
  const [progress, setProgress] = useState<ProgressData>({ client: [], server: [], facilitator: [] });

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('x402-learn-progress');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Failed to parse progress data');
      }
    }
  }, []);

  const roles = [
    {
      id: 'client',
      title: 'Client',
      subtitle: 'I want to pay for APIs',
      description: 'Learn to call payment-gated APIs and handle 402 responses',
      icon: Wallet,
      duration: '4 lessons • ~15 min',
      totalLessons: 4,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      progressColor: 'bg-blue-600',
    },
    {
      id: 'server',
      title: 'Server',
      subtitle: 'I want to accept payments',
      description: 'Learn to protect your API endpoints and accept x402 payments',
      icon: Server,
      duration: '4 lessons • ~15 min',
      totalLessons: 4,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      progressColor: 'bg-purple-600',
    },
    {
      id: 'facilitator',
      title: 'Facilitator',
      subtitle: 'I want to enable payments',
      description: 'Learn to build or host facilitators that power x402 transactions',
      icon: Network,
      duration: '3 lessons • ~15 min',
      totalLessons: 3,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      progressColor: 'bg-green-600',
    },
  ];

  const getProgress = (roleId: string) => {
    const completed = progress[roleId as keyof ProgressData]?.length || 0;
    const total = roles.find(r => r.id === roleId)?.totalLessons || 0;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <NavDock />

        {/* Main Content */}
        <main className="flex-grow">
          {/* Choose Your Role */}
          <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-8 sm:mb-12 text-center">
              <h2 className="mb-6 text-3xl sm:text-4xl font-[family-name:var(--font-jersey-25)]">Choose Your Role</h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-base sm:text-lg font-medium mb-4">
                  Select the path that matches what you want to build
                </p>
                <div className="text-sm sm:text-base text-muted-foreground space-y-2">
                  <p>
                    <span className="font-semibold">How it works:</span> Client requests protected resource → Server responds with 402 + payment details → Client signs payment and submits through facilitator → Client retries with proof of payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const roleProgress = getProgress(role.id);
                const hasStarted = roleProgress.completed > 0;

                return (
                  <Link
                    key={role.id}
                    href={`/learn/${role.id}`}
                    className="group relative overflow-hidden rounded-lg border bg-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Progress Bar */}
                    {hasStarted && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
                        <div
                          className={`h-full ${role.progressColor} transition-all duration-500`}
                          style={{ width: `${roleProgress.percentage}%` }}
                        />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`mb-6 inline-flex items-center justify-center rounded-lg ${role.iconBg} p-3 sm:p-4`}>
                      <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${role.iconColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-xl sm:text-2xl font-bold">{role.title}</h3>
                    <p className="mb-4 text-xs sm:text-sm font-medium text-muted-foreground">{role.subtitle}</p>
                    <p className="mb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">{role.description}</p>

                    {/* Duration */}
                    <p className="mb-4 text-xs sm:text-sm text-muted-foreground">{role.duration}</p>

                    {/* Progress Indicator */}
                    {hasStarted ? (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-medium">Progress</span>
                          <span className="text-muted-foreground">
                            {roleProgress.completed}/{roleProgress.total} lessons
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 text-xs sm:text-sm text-muted-foreground">Not started</div>
                    )}

                    {/* Button */}
                    <div className={`flex items-center gap-2 font-semibold ${role.iconColor} group-hover:gap-3 transition-all text-sm sm:text-base`}>
                      {hasStarted ? 'Continue' : 'Start'} {role.title} Path
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card mt-auto">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
              <a
                href="https://x402.gitbook.io/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                Read the docs
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </footer>

        {/* Spacer for mobile nav dock */}
        <div className="h-20 sm:h-0" />
      </div>

      <MobileNavDock />
    </>
  );
}
