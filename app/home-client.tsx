'use client';

import { useApp, onboardingAnswersToFilters } from '@/lib/app-context';
import { OnboardingFlow } from '@/components/onboarding-flow';
import { BrowseContent } from '@/components/browse-content';
import { LoadingScreen } from '@/components/loading-screen';
import type { OnboardingAnswers, TaxonomyData, ContentItem } from '@/lib/types';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

interface HomeClientProps {
  taxonomy: TaxonomyData;
  contentItems: ContentItem[];
}

export function HomeClient({ taxonomy, contentItems }: HomeClientProps) {
  const { showOnboarding, setShowOnboarding, setFilters, setOnboardingComplete } = useApp();

  const handleOnboardingComplete = (answers: OnboardingAnswers) => {
    const newFilters = onboardingAnswersToFilters(answers);
    setFilters(newFilters);
    setOnboardingComplete(true);
  };

  return (
    <LoadingScreen>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">x402 Repo</h1>
                <p className="text-muted-foreground mt-1">
                  Navigate and discover the x402 payment protocol
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat Assistant
                </Link>
                <a
                  href="https://github.com/coinbase/x402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Onboarding Dialog */}
        <OnboardingFlow
          questions={taxonomy.onboarding.questions}
          onComplete={handleOnboardingComplete}
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
          contentItems={contentItems}
        />

        {/* Browse Content */}
        <BrowseContent taxonomy={taxonomy} contentItems={contentItems} />
      </div>
    </LoadingScreen>
  );
}
