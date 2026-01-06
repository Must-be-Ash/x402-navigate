'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { FilterState, OnboardingAnswers } from './types';

interface AppContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FILTERS: 'x402-filters',
  ONBOARDING_COMPLETE: 'x402-onboarding-complete',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FilterState>({});
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
      if (savedFilters) {
        setFiltersState(JSON.parse(savedFilters));
      }

      const savedOnboardingComplete = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      const isComplete = savedOnboardingComplete === 'true';
      setOnboardingCompleteState(isComplete);

      // Show onboarding if not completed
      if (!isComplete) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }, []);

  // Save filters to localStorage when they change
  const setFilters = (newFilters: FilterState) => {
    setFiltersState(newFilters);
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(newFilters));
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    }
  };

  // Save onboarding completion to localStorage
  const setOnboardingComplete = (complete: boolean) => {
    setOnboardingCompleteState(complete);
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, String(complete));
      } catch (error) {
        console.error('Error saving onboarding state:', error);
      }
    }
  };

  const value: AppContextType = {
    filters,
    setFilters,
    onboardingComplete,
    setOnboardingComplete,
    showOnboarding,
    setShowOnboarding,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

/**
 * Convert onboarding answers to filters
 */
export function onboardingAnswersToFilters(answers: OnboardingAnswers): FilterState {
  const filters: FilterState = {};

  // Map goal to role
  if (answers.goal) {
    const goalToRole: Record<string, string> = {
      'accept-payments': 'server',
      'make-payments': 'client',
      'run-facilitator': 'facilitator',
    };

    const role = goalToRole[answers.goal];
    if (role) {
      filters.role = role as FilterState['role'];
    }
  }

  // Map language
  if (answers.language && answers.language !== 'any') {
    filters.language = answers.language;
  }

  // Map framework
  if (answers.framework) {
    filters.framework = answers.framework;
  }

  // Map experience to complexity
  if (answers.experience) {
    filters.complexity = answers.experience;
  }

  return filters;
}
