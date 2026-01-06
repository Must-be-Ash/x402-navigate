'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { preprocessMarkdown } from '@/lib/markdown-preprocessor';

interface CodeViewerProps {
  files: Array<{
    name: string;
    content: string;
    language: string;
  }>;
}

export function CodeViewer({ files }: CodeViewerProps) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = async (content: string, fileName: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  if (files.length === 0) {
    return null;
  }

  // If only one file, don't show tabs
  if (files.length === 1) {
    const file = files[0];
    const isMarkdown = file.name.toLowerCase().endsWith('.md');

    return (
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-medium">{file.name}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(file.content, file.name)}
          >
            {copiedFile === file.name ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="overflow-x-auto">
          {isMarkdown ? (
            <div className="p-6 prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {preprocessMarkdown(file.content)}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="p-6 text-sm">
              <code>{file.content}</code>
            </pre>
          )}
        </div>
      </Card>
    );
  }

  // Multiple files - show tabs (browser-style)
  return (
    <Tabs defaultValue={files[0].name} className="w-full">
      <div className="bg-muted/30 border-b overflow-x-auto">
        <TabsList className="h-auto p-0 bg-transparent w-max justify-start gap-1 px-2 pt-2 flex-nowrap">
          {files.map((file) => (
            <TabsTrigger
              key={file.name}
              value={file.name}
              className="
                px-4 py-2 font-mono text-sm whitespace-nowrap
                rounded-t-lg border border-b-0
                data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground
                data-[state=inactive]:border-transparent data-[state=inactive]:hover:bg-muted
                data-[state=active]:bg-background data-[state=active]:text-foreground
                data-[state=active]:border-border data-[state=active]:shadow-sm
                transition-all
              "
            >
              {file.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {files.map((file) => {
        const isMarkdown = file.name.toLowerCase().endsWith('.md');

        return (
          <TabsContent key={file.name} value={file.name} className="mt-0">
            <Card className="rounded-t-none">
              <div className="flex items-center justify-end px-4 py-2 border-b bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(file.content, file.name)}
                >
                  {copiedFile === file.name ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="overflow-x-auto">
                {isMarkdown ? (
                  <div className="p-6 prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {preprocessMarkdown(file.content)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <pre className="p-6 text-sm">
                    <code>{file.content}</code>
                  </pre>
                )}
              </div>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
