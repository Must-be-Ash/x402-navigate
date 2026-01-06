'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{file.name}</span>
            <Badge variant="outline" className="text-xs">
              {file.language}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(file.content, file.name)}
          >
            {copiedFile === file.name ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm">
            <code>{file.content}</code>
          </pre>
        </div>
      </Card>
    );
  }

  // Multiple files - show tabs
  return (
    <Tabs defaultValue={files[0].name} className="w-full">
      <div className="flex items-center justify-between border-b bg-muted">
        <TabsList className="h-auto p-0 bg-transparent">
          {files.map((file) => (
            <TabsTrigger
              key={file.name}
              value={file.name}
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <span className="text-sm font-mono">{file.name}</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {file.language}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {files.map((file) => (
        <TabsContent key={file.name} value={file.name} className="mt-0">
          <Card className="rounded-t-none border-t-0">
            <div className="flex items-center justify-end px-4 py-2 border-b bg-muted/50">
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
              <pre className="p-4 text-sm">
                <code>{file.content}</code>
              </pre>
            </div>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
