'use client';

import { useApp, onboardingAnswersToFilters } from '@/lib/app-context';
import { OnboardingFlow } from '@/components/onboarding-flow';
import { BrowseContent } from '@/components/browse-content';
import { LoadingScreen } from '@/components/loading-screen';
import { NavDock, MobileNavDock } from '@/components/nav-dock';
import type { OnboardingAnswers, TaxonomyData, ContentItem } from '@/lib/types';

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
    <>
      <LoadingScreen>
        <div className="min-h-screen bg-background">
          <NavDock />

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

          {/* Spacer for mobile nav dock */}
          <div className="h-20 sm:h-0" />
        </div>
      </LoadingScreen>

      <MobileNavDock />
    </>
  );
}
