'use client';

import { useState } from 'react';
import { Play, Loader2, CheckCircle, XCircle, Circle } from 'lucide-react';
import type { Exercise as ExerciseType } from '@/lib/lessons/types';

interface ExerciseProps {
  exercise: ExerciseType;
  onComplete?: () => void;
}

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export function Exercise({ exercise, onComplete }: ExerciseProps) {
  const [code, setCode] = useState(exercise.starterCode);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setAllPassed(false);

    try {
      // TODO: In a real implementation, this would run tests in a sandbox
      // For now, simulate test execution

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate test results based on code content
      const results: TestResult[] = exercise.tests.map(test => {
        // Simple heuristic: check if code includes keywords from test name
        const keywords = test.name.toLowerCase().split(' ');
        const hasKeywords = keywords.some(keyword =>
          code.toLowerCase().includes(keyword)
        );

        return {
          name: test.name,
          passed: hasKeywords,
          message: hasKeywords
            ? 'Test passed!'
            : `Failed: ${test.description}`,
        };
      });

      setTestResults(results);

      const passed = results.every(r => r.passed);
      setAllPassed(passed);

      if (passed && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="my-8 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white">
        <h3 className="text-xl font-semibold mb-1">{exercise.title}</h3>
        <p className="text-sm text-purple-100">{exercise.description}</p>
      </div>

      {/* Requirements Checklist */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Requirements:</h4>
        <div className="space-y-2">
          {exercise.tests.map((test, index) => {
            const result = testResults.find(r => r.name === test.name);

            return (
              <div key={index} className="flex items-start gap-2">
                {result ? (
                  result.passed ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                  )
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-slate-300 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      result
                        ? result.passed
                          ? 'text-green-700'
                          : 'text-red-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {test.name}
                  </p>
                  <p className="text-xs text-slate-500">{test.description}</p>
                  {result && !result.passed && result.message && (
                    <p className="mt-1 text-xs text-red-600">{result.message}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Editor */}
      <div className="border-b border-slate-200">
        <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
          <span className="text-xs font-medium text-slate-400">Your Solution</span>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className={`flex items-center gap-2 rounded px-3 py-1 text-sm font-semibold transition-all ${
              isRunning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Run Tests
              </>
            )}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full resize-none bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:outline-none"
          rows={16}
          spellCheck={false}
        />
      </div>

      {/* Test Results Summary */}
      {testResults.length > 0 && (
        <div className={`p-6 ${allPassed ? 'bg-green-50' : 'bg-red-50'}`}>
          {allPassed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">All tests passed!</span>
              </div>
              {onComplete && (
                <p className="text-sm text-green-700">
                  Excellent work! Marking lesson as complete...
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <span className="font-semibold">
                {testResults.filter(r => !r.passed).length} test(s) failed. Keep trying!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
