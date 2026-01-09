'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { Quiz as QuizType } from '@/lib/lessons/types';

interface QuizProps {
  quiz: QuizType;
  onComplete?: () => void;
}

export function Quiz({ quiz, onComplete }: QuizProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const selected = quiz.options[selectedOption];
    setSubmitted(true);
    setIsCorrect(selected.correct);

    if (selected.correct && onComplete) {
      // Call onComplete after a short delay for better UX
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className="my-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Knowledge Check
        </h3>
        <p className="text-lg text-slate-700">{quiz.question}</p>
        {quiz.hint && !submitted && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">
              <span className="font-medium">Hint:</span> {quiz.hint}
            </p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {quiz.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const showFeedback = submitted && isSelected;

          return (
            <button
              key={index}
              onClick={() => !submitted && setSelectedOption(index)}
              disabled={submitted}
              className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                submitted
                  ? isSelected
                    ? option.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-slate-200 bg-slate-50 opacity-50'
                  : isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                {/* Radio / Status Icon */}
                <div className="mt-1">
                  {showFeedback ? (
                    option.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )
                  ) : (
                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="flex h-full items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      showFeedback
                        ? option.correct
                          ? 'text-green-900'
                          : 'text-red-900'
                        : isSelected
                        ? 'text-blue-900'
                        : 'text-slate-900'
                    }`}
                  >
                    {option.label}
                  </p>
                  {showFeedback && option.explanation && (
                    <p
                      className={`mt-2 text-sm ${
                        option.correct ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {option.explanation}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit / Try Again / Continue */}
      <div className="flex items-center justify-between">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className={`rounded-lg px-6 py-3 font-semibold transition-all ${
              selectedOption === null
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
            }`}
          >
            Submit Answer
          </button>
        ) : isCorrect ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Correct!</span>
            </div>
            {onComplete && (
              <span className="text-sm text-slate-600">
                Marking lesson as complete...
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <XCircle className="h-5 w-5" />
              <span>Not quite right</span>
            </div>
            <button
              onClick={handleTryAgain}
              className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
