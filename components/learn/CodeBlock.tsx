'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = 'typescript', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-sm font-medium text-slate-300">{filename}</span>
          )}
          {!filename && language && (
            <span className="text-xs font-medium text-slate-400 uppercase">{language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded px-2 py-1 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto p-4">
        <pre className="text-sm">
          <code className="text-slate-100 font-mono">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
