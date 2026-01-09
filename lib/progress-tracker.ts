/**
 * Progress Tracking System
 *
 * Manages user progress through x402 learn courses using localStorage.
 * Tracks completion of lessons per role (client, server, facilitator).
 */

const STORAGE_KEY = 'x402-learn-progress';

export interface ProgressData {
  client: number[];
  server: number[];
  facilitator: number[];
}

/**
 * Get the current progress data from localStorage
 */
export function getProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return { client: [], server: [], facilitator: [] };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { client: [], server: [], facilitator: [] };
  }

  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse progress data:', e);
    return { client: [], server: [], facilitator: [] };
  }
}

/**
 * Save progress data to localStorage
 */
export function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save progress data:', e);
  }
}

/**
 * Mark a lesson as complete
 */
export function markLessonComplete(
  role: 'client' | 'server' | 'facilitator',
  lessonId: number
): void {
  const progress = getProgress();

  if (!progress[role].includes(lessonId)) {
    progress[role].push(lessonId);
    progress[role].sort((a, b) => a - b); // Keep sorted
    saveProgress(progress);
  }
}

/**
 * Check if a specific lesson is complete
 */
export function isLessonComplete(
  role: 'client' | 'server' | 'facilitator',
  lessonId: number
): boolean {
  const progress = getProgress();
  return progress[role].includes(lessonId);
}

/**
 * Get progress for a specific role
 */
export function getLessonProgress(role: 'client' | 'server' | 'facilitator'): {
  completed: number[];
  total: number;
  percentage: number;
} {
  const progress = getProgress();
  const completed = progress[role] || [];

  // Total lessons per role
  const totalLessons: Record<typeof role, number> = {
    client: 4,
    server: 4,
    facilitator: 3,
  };

  const total = totalLessons[role];
  const percentage = total > 0 ? (completed.length / total) * 100 : 0;

  return {
    completed,
    total,
    percentage,
  };
}

/**
 * Reset progress for a specific role or all roles
 */
export function resetProgress(role?: 'client' | 'server' | 'facilitator'): void {
  if (role) {
    const progress = getProgress();
    progress[role] = [];
    saveProgress(progress);
  } else {
    // Reset all progress
    saveProgress({ client: [], server: [], facilitator: [] });
  }
}

/**
 * Get overall progress across all roles
 */
export function getOverallProgress(): {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
} {
  const progress = getProgress();

  const completedLessons =
    progress.client.length + progress.server.length + progress.facilitator.length;
  const totalLessons = 4 + 4 + 3; // client + server + facilitator

  return {
    completedLessons,
    totalLessons,
    percentage: (completedLessons / totalLessons) * 100,
  };
}
