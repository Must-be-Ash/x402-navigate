'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { filterAvailableOptions } from '@/lib/onboarding-filter';
import type { OnboardingAnswers, OnboardingQuestion, OnboardingOption, ContentItem } from '@/lib/types';

interface OnboardingFlowProps {
  questions: OnboardingQuestion[];
  onComplete: (answers: OnboardingAnswers) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentItems: ContentItem[];
}

export function OnboardingFlow({ questions, onComplete, open, onOpenChange, contentItems }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const currentQuestion = questions[currentStep];

  // Get options for current question
  const getOptions = (): OnboardingOption[] => {
    if (!currentQuestion.options) return [];

    let rawOptions: OnboardingOption[] = [];

    if (Array.isArray(currentQuestion.options)) {
      rawOptions = currentQuestion.options;
    } else if (currentQuestion.id === 'framework' && answers.language) {
      // Handle conditional options based on previous answers
      rawOptions = currentQuestion.options[answers.language] || [];

      // Filter framework options by their role metadata if user has selected a goal
      if (answers.goal) {
        const goalToRole: Record<string, string> = {
          'accept-payments': 'server',
          'make-payments': 'client',
          'run-facilitator': 'facilitator',
        };

        const userRole = goalToRole[answers.goal];
        if (userRole) {
          rawOptions = rawOptions.filter(option => {
            // Show options that match the user's role or are marked as "both"
            return !option.role || option.role === 'both' || option.role === userRole;
          });
        }
      }
    } else {
      return [];
    }

    // Filter options to only show those with available content
    return filterAvailableOptions(currentQuestion.id, rawOptions, answers, contentItems);
  };

  const options = getOptions();

  // Check if current question should be shown based on dependencies
  const shouldShowQuestion = (): boolean => {
    if (!currentQuestion.depends_on) return true;

    for (const [key, values] of Object.entries(currentQuestion.depends_on)) {
      const answer = answers[key as keyof OnboardingAnswers];
      if (!answer || !values.includes(answer)) {
        return false;
      }
    }

    return true;
  };

  const handleSelectOption = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        // Skip questions that don't meet dependencies
        let nextStep = currentStep + 1;
        while (nextStep < questions.length) {
          const nextQuestion = questions[nextStep];
          if (!nextQuestion.depends_on) break;

          let shouldShow = true;
          for (const [key, values] of Object.entries(nextQuestion.depends_on)) {
            const answer = newAnswers[key as keyof OnboardingAnswers];
            if (!answer || !values.includes(answer)) {
              shouldShow = false;
              break;
            }
          }

          if (shouldShow) break;
          nextStep++;
        }

        if (nextStep < questions.length) {
          setCurrentStep(nextStep);
        } else {
          handleComplete(newAnswers);
        }
      } else {
        handleComplete(newAnswers);
      }
    }, 300);
  };

  const handleComplete = (finalAnswers: OnboardingAnswers) => {
    onComplete(finalAnswers);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete(answers);
  };

  // Skip questions that shouldn't be shown
  useEffect(() => {
    if (open && !shouldShowQuestion()) {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, answers, open]);

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex-shrink-0">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl sm:text-2xl">Welcome to x402 Discovery</DialogTitle>
            <DialogDescription className="text-sm">
              Help us personalize your experience
            </DialogDescription>
          </DialogHeader>

          {/* Progress bar */}
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0 -mx-4 px-4">
          {/* Question */}
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-base font-medium sm:text-lg md:text-xl">{currentQuestion?.question}</h3>
              <p className="text-xs text-muted-foreground mt-1 md:text-sm">
                Step {currentStep + 1} of {questions.length}
              </p>
            </div>

            {/* Options */}
            <div className="grid gap-2.5">
              {options.map((option) => {
                const isSelected = answers[currentQuestion.id as keyof OnboardingAnswers] === option.id;

                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:border-primary/30 border-border/80 ${isSelected ? 'border-primary/60 ring-1 ring-primary/10 bg-primary/3' : ''
                      }`}
                    onClick={() => handleSelectOption(option.id)}
                  >
                    <CardHeader className="pb-1 pt-1.5 px-2">
                      <CardTitle className="text-sm font-normal md:text-base">
                        {option.label}
                      </CardTitle>
                      {option.description && (
                        <CardDescription className="text-xs mt-0 md:text-sm">
                          {option.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation - fixed at bottom */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="h-8"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>

          <Button variant="ghost" size="sm" onClick={handleSkip} className="h-8 text-xs">
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
