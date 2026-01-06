// Type definitions for the x402 discovery site

export type Role = 'client' | 'server' | 'facilitator' | 'both';
export type Language = 'typescript' | 'go' | 'python' | 'java' | 'any';
export type Complexity = 'beginner' | 'intermediate' | 'advanced';
export type ContentType = 'quickstart' | 'example' | 'guide' | 'reference' | 'concept' | 'spec';

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  depends_on?: Record<string, string[]>;
  options: OnboardingOption[] | Record<string, OnboardingOption[]>;
}

export interface OnboardingOption {
  id: string;
  label: string;
  description?: string;
  maps_to?: string;
  role?: Role;
}

export interface OnboardingAnswers {
  goal?: string;
  language?: Language;
  framework?: string;
  experience?: Complexity;
}

export interface ContentItem {
  id: string;
  title: string;
  path: string;
  type: ContentType;
  role?: Role;
  language?: Language;
  framework?: string;
  complexity?: Complexity;
  features?: string[];
  networks?: string[];
  description: string;
  files?: string[];
  content?: string; // Actual file content (loaded at build time)
}

export interface TaxonomyData {
  metadata: {
    version: string;
    description: string;
    lastUpdated: string;
  };
  onboarding: {
    questions: OnboardingQuestion[];
  };
  content_types: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
  tags: {
    roles: Role[];
    languages: Language[];
    frameworks: Record<string, string[]>;
    complexity: Complexity[];
    features: string[];
    networks: string[];
    payment_schemes: string[];
  };
  content_map: ContentItem[];
}

export interface FilterState {
  role?: Role;
  language?: Language;
  framework?: string;
  complexity?: Complexity;
  features?: string[];
  search?: string;
}

export interface FileContent {
  path: string;
  content: string;
  language: string;
}
