'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Lock, Play, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProgressData {
  client: number[];
  server: number[];
  facilitator: number[];
}

export default function ClientPathPage() {
  const [progress, setProgress] = useState<number[]>([]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('x402-learn-progress');
    if (savedProgress) {
      try {
        const data: ProgressData = JSON.parse(savedProgress);
        setProgress(data.client || []);
      } catch (e) {
        console.error('Failed to parse progress data');
      }
    }
  }, []);

  const lessons = [
    {
      id: 1,
      title: 'Understanding the x402 Flow (Client Perspective)',
      description: 'Learn the request → 402 → payment → retry cycle',
      duration: '10 min',
    },
    {
      id: 2,
      title: 'Your First x402 Request',
      description: 'Make a successful payment-gated API call using @x402/fetch',
      duration: '15 min',
    },
    {
      id: 3,
      title: 'Handling Payment Challenges',
      description: 'Understand and handle errors (insufficient funds, failures, timeouts)',
      duration: '12 min',
    },
    {
      id: 4,
      title: 'Real-World Client Implementation',
      description: 'Build a complete client app with best practices',
      duration: '20 min',
    },
  ];

  const isLessonComplete = (lessonId: number) => progress.includes(lessonId);
  const isLessonAvailable = (lessonId: number) => {
    if (lessonId === 1) return true;
    return progress.includes(lessonId - 1);
  };

  const completedCount = progress.length;
  const totalLessons = lessons.length;
  const progressPercentage = (completedCount / totalLessons) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Learn</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Client Path</h1>
              <p className="text-blue-100">Pay for APIs</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Your Progress</span>
              <span className="text-blue-100">
                {completedCount}/{totalLessons} lessons complete
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blue-800/50">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lessons */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-6">
          {lessons.map((lesson) => {
            const isComplete = isLessonComplete(lesson.id);
            const isAvailable = isLessonAvailable(lesson.id);
            const isLocked = !isAvailable;

            return (
              <div
                key={lesson.id}
                className={`relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
                  isLocked
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-6 p-6">
                  {/* Lesson Number / Status Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-bold ${
                      isComplete
                        ? 'bg-green-100 text-green-600'
                        : isLocked
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : isLocked ? (
                      <Lock className="h-6 w-6" />
                    ) : (
                      <span className="text-lg">{lesson.id}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold text-slate-900">
                      {lesson.title}
                    </h3>
                    <p className="mb-4 text-slate-600">{lesson.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{lesson.duration}</span>
                      {isComplete && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">Completed</span>
                        </>
                      )}
                      {isLocked && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">
                            Complete Lesson {lesson.id - 1} to unlock
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {isAvailable && (
                    <Link
                      href={`/learn/client/${lesson.id}`}
                      className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all ${
                        isComplete
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800'
                      }`}
                    >
                      {isComplete ? (
                        <>Review</>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start
                        </>
                      )}
                    </Link>
                  )}
                </div>

                {/* Completion Indicator */}
                {isComplete && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedCount === totalLessons && (
          <div className="mt-12 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-green-500 p-3">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-green-900">
              Congratulations! 🎉
            </h3>
            <p className="mb-6 text-green-800">
              You've completed the Client Path. You're now ready to build payment-gated API clients with x402!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/learn"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-green-700 shadow-sm hover:bg-green-50 transition-colors"
              >
                Explore Other Paths
              </Link>
              <Link
                href="/"
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-green-700 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
