'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import { FilterBar } from '@/components/filter-bar';
import { ContentCard } from '@/components/content-card';
import { filterContent, groupContentByType } from '@/lib/content-filter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Code2, Lightbulb, FileText, Rocket } from 'lucide-react';
import type { ContentItem, TaxonomyData } from '@/lib/types';

const typeIcons = {
  quickstart: Rocket,
  example: Code2,
  guide: Book,
  reference: FileText,
  concept: Lightbulb,
  spec: FileText,
};

interface BrowseContentProps {
  taxonomy: TaxonomyData;
  contentItems: ContentItem[];
}

export function BrowseContent({ taxonomy, contentItems }: BrowseContentProps) {
  const { filters, setFilters, setShowOnboarding } = useApp();

  const filteredContent = useMemo(() => {
    return filterContent(contentItems, filters);
  }, [contentItems, filters]);

  const groupedContent = useMemo(() => {
    return groupContentByType(filteredContent);
  }, [filteredContent]);

  const contentTypes = taxonomy.content_types;
  const orderedTypes = ['quickstart', 'example', 'guide', 'concept', 'reference', 'spec'];

  return (
    <>
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onOpenPreferences={() => setShowOnboarding(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {filteredContent.length === 0 ? (
          <Card className="p-12 text-center">
            <CardHeader>
              <CardTitle>No content found</CardTitle>
              <CardDescription>
                Try adjusting your filters or{' '}
                <button
                  onClick={() => setFilters({})}
                  className="text-primary hover:underline"
                >
                  clear all filters
                </button>
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6 overflow-x-auto">
              <TabsList className="w-max">
                <TabsTrigger value="all" className="whitespace-nowrap">
                  All ({filteredContent.length})
                </TabsTrigger>
                {orderedTypes.map((typeId) => {
                  const count = groupedContent[typeId]?.length || 0;
                  const typeInfo = contentTypes.find((t) => t.id === typeId);
                  if (count === 0 || !typeInfo) return null;

                  const Icon = typeIcons[typeId as keyof typeof typeIcons] || FileText;

                  return (
                    <TabsTrigger key={typeId} value={typeId} className="whitespace-nowrap">
                      <Icon className="h-4 w-4 mr-2" />
                      {typeInfo.name} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredContent.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            {orderedTypes.map((typeId) => {
              const items = groupedContent[typeId] || [];
              if (items.length === 0) return null;

              return (
                <TabsContent key={typeId} value={typeId} className="mt-0">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <ContentCard key={item.id} item={item} />
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </main>
    </>
  );
}
