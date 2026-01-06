import type { ContentItem, OnboardingAnswers, OnboardingOption } from './types';

/**
 * Filter onboarding options to only show those that have available content
 */
export function filterAvailableOptions(
  questionId: string,
  options: OnboardingOption[],
  currentAnswers: OnboardingAnswers,
  allContent: ContentItem[]
): OnboardingOption[] {
  return options.filter(option => {
    // Simulate what the final answers would be if this option is selected
    const potentialAnswers = { ...currentAnswers, [questionId]: option.id };

    // Check if there's any content that matches these criteria
    const hasMatchingContent = allContent.some(item => {
      // Check goal/role match
      if (potentialAnswers.goal) {
        const goalMapping: Record<string, string> = {
          'accept-payments': 'server',
          'make-payments': 'client',
          'run-facilitator': 'facilitator',
          'understand': 'docs'
        };

        const expectedRole = goalMapping[potentialAnswers.goal];

        // For docs, match concept/guide/spec types
        if (expectedRole === 'docs') {
          if (!['concept', 'guide', 'spec', 'quickstart', 'reference'].includes(item.type)) {
            return false;
          }
        } else {
          // For other roles, require that the item has the matching role
          // Items without a role field or with a different role should not match
          if (!item.role || item.role !== expectedRole) {
            return false;
          }
        }
      }

      // Check language match
      if (potentialAnswers.language && potentialAnswers.language !== 'any') {
        if (item.language && item.language !== potentialAnswers.language) {
          return false;
        }
      }

      // Check framework match
      if (potentialAnswers.framework && potentialAnswers.framework !== 'custom') {
        if (item.framework && item.framework !== potentialAnswers.framework) {
          return false;
        }
      }

      // Check experience/complexity match
      if (potentialAnswers.experience) {
        if (!item.complexity || item.complexity !== potentialAnswers.experience) {
          return false;
        }
      }

      // If we get here, this item matches
      return true;
    });

    return hasMatchingContent;
  });
}
