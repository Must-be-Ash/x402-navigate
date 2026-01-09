/**
 * Lesson Data Types
 *
 * TypeScript interfaces for lesson content structure
 */

export type Role = 'client' | 'server' | 'facilitator';

export interface QuizOption {
  label: string;
  correct: boolean;
  explanation?: string;
}

export interface Quiz {
  question: string;
  options: QuizOption[];
  hint?: string;
}

export interface PlaygroundConfig {
  starterCode: string;
  expectedOutput?: string;
  testEndpoint?: string;
  language?: string; // default: 'typescript'
  hint?: {
    explanation: string;
    solutionCode: string;
  };
}

export interface ExerciseTest {
  name: string;
  description: string;
  test: string; // Test function code
}

export interface Exercise {
  title: string;
  description: string;
  starterCode: string;
  tests: ExerciseTest[];
  solution?: string; // Optional solution code
}

export interface InteractiveElement {
  type: 'quiz' | 'playground' | 'exercise' | 'demo';
  config: Quiz | PlaygroundConfig | Exercise | Record<string, any>;
}

export interface LessonSection {
  type: 'text' | 'code' | 'callout' | 'diagram' | 'list' | 'table';
  content: string;
  language?: string; // For code blocks
  variant?: 'info' | 'warning' | 'success' | 'error'; // For callouts
}

export interface Lesson {
  id: number;
  role: Role;
  title: string;
  description: string;
  duration: string; // e.g., "10 min"
  objectives: string[];
  sections: LessonSection[];
  interactive?: InteractiveElement;
  nextSteps?: {
    title: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  };
}

export interface LessonMetadata {
  id: number;
  title: string;
  description: string;
  duration: string;
}

export interface CourseData {
  role: Role;
  title: string;
  description: string;
  totalDuration: string;
  lessons: LessonMetadata[];
}
