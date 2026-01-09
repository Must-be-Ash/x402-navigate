/**
 * React Hook for Progress Tracking
 *
 * Provides reactive progress tracking with automatic updates when progress changes.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getProgress,
  markLessonComplete as markComplete,
  isLessonComplete as checkLessonComplete,
  getLessonProgress as getProgressForRole,
  resetProgress as resetProgressData,
  getOverallProgress as getOverall,
  type ProgressData,
} from '../progress-tracker';

export function useProgress(role?: 'client' | 'server' | 'facilitator') {
  const [progress, setProgress] = useState<ProgressData>({
    client: [],
    server: [],
    facilitator: [],
  });

  // Load progress from localStorage
  useEffect(() => {
    setProgress(getProgress());
  }, []);

  // Subscribe to storage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'x402-learn-progress') {
        setProgress(getProgress());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Mark a lesson as complete and update state
  const markLessonComplete = useCallback(
    (lessonRole: 'client' | 'server' | 'facilitator', lessonId: number) => {
      markComplete(lessonRole, lessonId);
      setProgress(getProgress());
    },
    []
  );

  // Check if a lesson is complete
  const isLessonComplete = useCallback(
    (lessonRole: 'client' | 'server' | 'facilitator', lessonId: number) => {
      return checkLessonComplete(lessonRole, lessonId);
    },
    [progress]
  );

  // Reset progress and update state
  const resetProgress = useCallback(
    (resetRole?: 'client' | 'server' | 'facilitator') => {
      resetProgressData(resetRole);
      setProgress(getProgress());
    },
    []
  );

  // Get progress for specific role or current role
  const roleProgress = role ? getProgressForRole(role) : null;

  // Get overall progress
  const overallProgress = getOverall();

  return {
    progress,
    roleProgress,
    overallProgress,
    markLessonComplete,
    isLessonComplete,
    resetProgress,
  };
}
