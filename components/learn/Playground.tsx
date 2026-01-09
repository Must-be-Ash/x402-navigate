'use client';

import { useState } from 'react';
import { Play, Loader2, CheckCircle, XCircle, Lightbulb, Copy, Check } from 'lucide-react';
import type { PlaygroundConfig } from '@/lib/lessons/types';

interface PlaygroundProps {
  config: PlaygroundConfig;
  onSuccess?: () => void;
}

export function Playground({ config, onSuccess }: PlaygroundProps) {
  const [code, setCode] = useState(config.starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setStatus('idle');

    try {
      // TODO: In a real implementation, this would send code to a backend
      // sandbox for execution. For now, we'll simulate execution.

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, check if code includes certain keywords
      const hasRequiredCode = code.includes('fetch402') || code.includes('withX402');

      if (hasRequiredCode) {
        setOutput(config.expectedOutput || '{ message: "Success! Code executed." }');
        setStatus('success');

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setOutput('Error: Required code not found. Make sure to use the x402 client.');
        setStatus('error');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopySolution = async () => {
    if (config.hint?.solutionCode) {
      await navigator.clipboard.writeText(config.hint.solutionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-8 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Interactive Playground</h3>
          <div className="flex items-center gap-2">
            {config.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                Hint
              </button>
            )}
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                isRunning
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hint Panel */}
      {showHint && config.hint && (
        <div className="border-b border-amber-200 bg-amber-50 p-4">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-amber-900">Hint</h4>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">
              {config.hint.explanation}
            </p>
          </div>
          {config.hint.solutionCode && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-amber-800">Solution Code:</span>
                <button
                  onClick={handleCopySolution}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                <code className="text-xs text-slate-100 font-mono">
                  {config.hint.solutionCode}
                </code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Code Editor */}
      <div className="border-b border-slate-200">
        <div className="bg-slate-800 px-4 py-2 text-xs font-medium text-slate-400">
          {config.language || 'typescript'}
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full resize-none bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:outline-none"
          rows={12}
          spellCheck={false}
        />
      </div>

      {/* Output Panel */}
      <div className="bg-slate-50">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 text-xs font-medium text-slate-600">
          <span>Output</span>
          {status === 'success' && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              Success
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="h-3 w-3" />
              Error
            </span>
          )}
        </div>
        <div className="min-h-[100px] p-4">
          {output ? (
            <pre
              className={`font-mono text-sm ${
                status === 'success'
                  ? 'text-green-700'
                  : status === 'error'
                  ? 'text-red-700'
                  : 'text-slate-700'
              }`}
            >
              {output}
            </pre>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Click "Run Code" to see the output
            </p>
          )}
        </div>
      </div>

      {/* Success Message */}
      {status === 'success' && onSuccess && (
        <div className="border-t border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <CheckCircle className="h-4 w-4" />
            Great job! Marking lesson as complete...
          </div>
        </div>
      )}
    </div>
  );
}
