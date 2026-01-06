import type { ContentItem } from './types';

/**
 * Filter content items based on criteria (client-safe version)
 */
export function filterContent(
  items: ContentItem[],
  filters: {
    role?: string;
    language?: string;
    framework?: string;
    complexity?: string;
    features?: string[];
    type?: string;
    search?: string;
  }
): ContentItem[] {
  return items.filter(item => {
    // Filter by role
    if (filters.role && item.role !== filters.role) {
      return false;
    }

    // Filter by language
    if (filters.language && filters.language !== 'any' && item.language !== filters.language) {
      return false;
    }

    // Filter by framework - be lenient:
    // - Show items with matching framework
    // - Also show items with no framework specified (generic examples)
    if (filters.framework) {
      if (item.framework && item.framework !== filters.framework) {
        return false;
      }
      // If item has no framework, check if it's still relevant based on other criteria
      if (!item.framework && item.role && item.language) {
        // Generic examples without framework are OK if role and language match
      }
    }

    // Filter by complexity - show content at or below selected level:
    // - beginner: show only beginner
    // - intermediate: show beginner + intermediate
    // - advanced: show all levels
    if (filters.complexity) {
      const complexityLevels = ['beginner', 'intermediate', 'advanced'];
      const selectedLevel = complexityLevels.indexOf(filters.complexity);
      const itemLevel = item.complexity ? complexityLevels.indexOf(item.complexity) : 1; // default to intermediate

      if (itemLevel > selectedLevel) {
        return false;
      }
    }

    // Filter by features (item must have ALL requested features)
    if (filters.features && filters.features.length > 0) {
      if (!item.features || !filters.features.every(f => item.features?.includes(f))) {
        return false;
      }
    }

    // Filter by type
    if (filters.type && item.type !== filters.type) {
      return false;
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(searchLower);
      const matchesDescription = item.description?.toLowerCase().includes(searchLower);
      const matchesPath = item.path.toLowerCase().includes(searchLower);

      if (!matchesTitle && !matchesDescription && !matchesPath) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get content grouped by type
 */
export function groupContentByType(items: ContentItem[]): Record<string, ContentItem[]> {
  const grouped: Record<string, ContentItem[]> = {};

  for (const item of items) {
    if (!grouped[item.type]) {
      grouped[item.type] = [];
    }
    grouped[item.type].push(item);
  }

  return grouped;
}
