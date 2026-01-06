'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, BookOpen, Lightbulb, FileText, Rocket, FileCode } from 'lucide-react';
import type { ContentItem } from '@/lib/types';

const iconMap = {
  quickstart: Rocket,
  example: Code2,
  guide: BookOpen,
  reference: FileText,
  concept: Lightbulb,
  spec: FileCode,
};

const complexityColors = {
  beginner: 'bg-green-500/10 text-green-700 dark:text-green-400',
  intermediate: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  advanced: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

interface ContentCardProps {
  item: ContentItem;
}

export function ContentCard({ item }: ContentCardProps) {
  const Icon = iconMap[item.type] || FileText;

  return (
    <Link href={`/content/${item.id}`} className="block">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Icon className="h-5 w-5 text-primary flex-shrink-0" />
              <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
            </div>
            {item.complexity && (
              <Badge
                variant="outline"
                className={`${complexityColors[item.complexity]} flex-shrink-0`}
              >
                {item.complexity}
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm mt-2">
            {item.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {item.language && (
              <Badge variant="secondary" className="text-xs">
                {item.language}
              </Badge>
            )}

            {item.framework && (
              <Badge variant="secondary" className="text-xs">
                {item.framework}
              </Badge>
            )}

            {item.role && (
              <Badge variant="outline" className="text-xs">
                {item.role}
              </Badge>
            )}

            {item.features && item.features.slice(0, 2).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}

            {item.features && item.features.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{item.features.length - 2} more
              </Badge>
            )}
          </div>

          {item.type && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground">
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
