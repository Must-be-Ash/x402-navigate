'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clientLessons } from '@/lib/lessons/client';
import { LessonContent } from '@/components/learn/LessonContent';

interface ProgressData {
  client: number[];
  server: number[];
  facilitator: number[];
}

export default function ClientLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.id as string);
  const [progress, setProgress] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem('x402-learn-progress');
    if (savedProgress) {
      try {
        const data: ProgressData = JSON.parse(savedProgress);
        setProgress(data.client || []);
        setIsComplete(data.client?.includes(lessonId) || false);
      } catch (e) {
        console.error('Failed to parse progress data');
      }
    }
  }, [lessonId]);

  const lessons = [
    {
      id: 1,
      title: 'Understanding the x402 Flow (Client Perspective)',
      duration: '10 min',
    },
    {
      id: 2,
      title: 'Your First x402 Request',
      duration: '15 min',
    },
    {
      id: 3,
      title: 'Handling Payment Challenges',
      duration: '12 min',
    },
    {
      id: 4,
      title: 'Real-World Client Implementation',
      duration: '20 min',
    },
  ];

  const currentLesson = lessons.find(l => l.id === lessonId);
  const previousLesson = lessons.find(l => l.id === lessonId - 1);
  const nextLesson = lessons.find(l => l.id === lessonId + 1);

  // Get full lesson data
  const lessonData = clientLessons.find(l => l.id === lessonId);

  const markComplete = () => {
    const savedProgress = localStorage.getItem('x402-learn-progress');
    let data: ProgressData = { client: [], server: [], facilitator: [] };

    if (savedProgress) {
      try {
        data = JSON.parse(savedProgress);
      } catch (e) {
        console.error('Failed to parse progress data');
      }
    }

    if (!data.client.includes(lessonId)) {
      data.client.push(lessonId);
      localStorage.setItem('x402-learn-progress', JSON.stringify(data));
      setIsComplete(true);
      setProgress(data.client);
    }
  };

  const navigateToNextLesson = () => {
    if (nextLesson) {
      router.push(`/learn/client/${nextLesson.id}`);
    } else {
      router.push('/learn/client');
    }
  };

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Lesson Not Found</h1>
          <Link href="/learn/client" className="text-blue-600 hover:text-blue-700">
            Back to Client Path
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/learn/client"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Client Path</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-sm text-slate-600">
                Lesson {lessonId} of {lessons.length}
              </div>
            </div>
            {isComplete && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <CheckCircle className="h-4 w-4" />
                Completed
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-[73px] z-30 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-3">
          <div className="flex gap-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`h-1 flex-1 rounded-full transition-all ${
                  progress.includes(lesson.id)
                    ? 'bg-green-500'
                    : lesson.id === lessonId
                    ? 'bg-blue-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <div className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {currentLesson.duration}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {currentLesson.title}
          </h1>
        </div>

        {/* Lesson Content */}
        {lessonData ? (
          <LessonContent lesson={lessonData} onComplete={markComplete} />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto max-w-md">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Lesson Content Not Found
              </h2>
              <p className="text-slate-600 mb-8">
                This lesson data is missing. Please check the lesson configuration.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8">
          {previousLesson ? (
            <Link
              href={`/learn/client/${previousLesson.id}`}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <div>
                <div className="text-sm text-slate-500">Previous</div>
                <div className="font-medium">{previousLesson.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/learn/client/${nextLesson.id}`}
              className="flex items-center gap-2 text-right text-slate-600 hover:text-slate-900 transition-colors"
            >
              <div>
                <div className="text-sm text-slate-500">Next</div>
                <div className="font-medium">{nextLesson.title}</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/learn/client"
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors shadow-lg"
            >
              Complete Course
              <CheckCircle className="h-4 w-4" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
