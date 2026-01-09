'use client';

import type { Lesson } from '@/lib/lessons/types';
import { Callout } from './Callout';
import { CodeBlock } from './CodeBlock';
import { Quiz } from './Quiz';
import { Playground } from './Playground';
import { Exercise } from './Exercise';
import React from 'react';

interface LessonContentProps {
  lesson: Lesson;
  onComplete?: () => void;
}

// Helper function to parse inline markdown (bold and inline code)
function parseInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Look for bold text (**text**)
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Look for inline code (`code`)
    const codeMatch = remaining.match(/`([^`]+)`/);

    // Find which comes first
    const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
    const codeIndex = codeMatch ? remaining.indexOf(codeMatch[0]) : -1;

    // Determine which match comes first
    let firstMatch: 'bold' | 'code' | null = null;
    let firstIndex = -1;

    if (boldIndex !== -1 && (codeIndex === -1 || boldIndex < codeIndex)) {
      firstMatch = 'bold';
      firstIndex = boldIndex;
    } else if (codeIndex !== -1) {
      firstMatch = 'code';
      firstIndex = codeIndex;
    }

    if (firstMatch === null) {
      // No more matches, add remaining text
      if (remaining) {
        parts.push(remaining);
      }
      break;
    }

    // Add text before the match
    if (firstIndex > 0) {
      parts.push(remaining.substring(0, firstIndex));
    }

    if (firstMatch === 'bold' && boldMatch) {
      parts.push(
        <strong key={key++} className="font-semibold text-slate-900">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(firstIndex + boldMatch[0].length);
    } else if (firstMatch === 'code' && codeMatch) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-slate-100 text-sm font-mono text-slate-800">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(firstIndex + codeMatch[0].length);
    }
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

export function LessonContent({ lesson, onComplete }: LessonContentProps) {
  return (
    <div className="prose prose-slate max-w-none">
      {/* Objectives */}
      {lesson.objectives && lesson.objectives.length > 0 && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mt-0 mb-3 text-lg font-semibold text-blue-900">
            Learning Objectives
          </h3>
          <ul className="my-0 space-y-1.5">
            {lesson.objectives.map((objective, index) => (
              <li key={index} className="text-blue-800">
                {parseInlineMarkdown(objective)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lesson Sections */}
      {lesson.sections.map((section, index) => {
        switch (section.type) {
          case 'text':
            // Parse markdown-style headings and paragraphs
            const lines = section.content.split('\n').filter(line => line.trim());
            return (
              <div key={index} className="my-6">
                {lines.map((line, lineIndex) => {
                  // Check for markdown headings
                  if (line.startsWith('# ')) {
                    return (
                      <h2 key={lineIndex} className="mt-8 mb-4 text-2xl font-bold text-slate-900 first:mt-0">
                        {line.substring(2)}
                      </h2>
                    );
                  } else if (line.startsWith('## ')) {
                    return (
                      <h3 key={lineIndex} className="mt-6 mb-3 text-xl font-semibold text-slate-900">
                        {line.substring(3)}
                      </h3>
                    );
                  } else if (line.startsWith('### ')) {
                    return (
                      <h4 key={lineIndex} className="mt-4 mb-2 text-lg font-medium text-slate-900">
                        {line.substring(4)}
                      </h4>
                    );
                  }

                  // Check for numbered lists
                  const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
                  if (numberedMatch) {
                    return (
                      <div key={lineIndex} className="flex gap-2 my-2">
                        <span className="font-semibold text-slate-700">{numberedMatch[1]}.</span>
                        <span className="text-slate-700">{parseInlineMarkdown(numberedMatch[2])}</span>
                      </div>
                    );
                  }

                  // Check for bullet points
                  if (line.startsWith('- ')) {
                    return (
                      <div key={lineIndex} className="flex gap-2 my-2">
                        <span className="text-slate-700">•</span>
                        <span className="text-slate-700">{parseInlineMarkdown(line.substring(2))}</span>
                      </div>
                    );
                  }

                  // Regular paragraph
                  return (
                    <p key={lineIndex} className="my-4 text-slate-700 leading-relaxed">
                      {parseInlineMarkdown(line)}
                    </p>
                  );
                })}
              </div>
            );

          case 'code':
            return (
              <CodeBlock
                key={index}
                code={section.content}
                language={section.language}
              />
            );

          case 'callout':
            return (
              <Callout key={index} variant={section.variant}>
                {parseInlineMarkdown(section.content)}
              </Callout>
            );

          case 'list':
            const items = section.content.split('\n').filter(line => line.trim());
            return (
              <ul key={index} className="my-4 space-y-2">
                {items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-slate-700">
                    {parseInlineMarkdown(item.replace(/^[-*]\s*/, ''))}
                  </li>
                ))}
              </ul>
            );

          case 'table':
            // Simple table rendering (would need more complex parsing for real tables)
            return (
              <div key={index} className="my-6 overflow-x-auto">
                <pre className="text-sm text-slate-700">{section.content}</pre>
              </div>
            );

          default:
            return null;
        }
      })}

      {/* Interactive Element */}
      {lesson.interactive && (
        <div className="my-12">
          {lesson.interactive.type === 'quiz' && (
            <Quiz
              quiz={lesson.interactive.config as any}
              onComplete={onComplete}
            />
          )}

          {lesson.interactive.type === 'playground' && (
            <Playground
              config={lesson.interactive.config as any}
              onSuccess={onComplete}
            />
          )}

          {lesson.interactive.type === 'exercise' && (
            <Exercise
              exercise={lesson.interactive.config as any}
              onComplete={onComplete}
            />
          )}
        </div>
      )}

      {/* Next Steps */}
      {lesson.nextSteps && (
        <div className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h3 className="mt-0 mb-4 text-lg font-semibold text-slate-900">
            {lesson.nextSteps.title}
          </h3>
          <div className="space-y-2">
            {lesson.nextSteps.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="block text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {link.label} →
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
