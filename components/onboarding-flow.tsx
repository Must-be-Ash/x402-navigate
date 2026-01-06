'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import type { OnboardingAnswers, OnboardingQuestion, OnboardingOption } from '@/lib/types';

interface OnboardingFlowProps {
  questions: OnboardingQuestion[];
  onComplete: (answers: OnboardingAnswers) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingFlow({ questions, onComplete, open, onOpenChange }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const currentQuestion = questions[currentStep];

  // Get options for current question
  const getOptions = (): OnboardingOption[] => {
    if (!currentQuestion.options) return [];

    if (Array.isArray(currentQuestion.options)) {
      return currentQuestion.options;
    }

    // Handle conditional options based on previous answers
    if (currentQuestion.id === 'framework' && answers.language) {
      return currentQuestion.options[answers.language] || [];
    }

    return [];
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-5 w-5 text-primary" />
            <DialogTitle>Welcome to x402 Discovery</DialogTitle>
          </div>
          <DialogDescription>
            Help us personalize your experience. Answer a few questions so we can show you the most relevant content.
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{currentQuestion?.question}</h3>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {questions.length}
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {options.map((option) => {
              const isSelected = answers[currentQuestion.id as keyof OnboardingAnswers] === option.id;

              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    isSelected ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => handleSelectOption(option.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      {option.label}
                      {option.role && (
                        <Badge variant="outline" className="ml-2">
                          {option.role}
                        </Badge>
                      )}
                    </CardTitle>
                    {option.description && (
                      <CardDescription className="text-sm">
                        {option.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
