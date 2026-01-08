import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getContentItem, readDirectoryFiles, readRepoFile, buildContentIndex } from '@/lib/content-parser';
import { MarkdownViewer } from '@/components/markdown-viewer';
import { CodeViewer } from '@/components/code-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ExternalLink, Github } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const items = buildContentIndex();
  return items.map((item) => ({
    id: item.id,
  }));
}

export default async function ContentPage({ params }: PageProps) {
  const { id } = await params;
  const item = getContentItem(id);

  if (!item) {
    notFound();
  }

  // Determine if it's a markdown file or code example
  const isMarkdown = item.path.endsWith('.md');
  const isDirectory = item.files && item.files.length > 0;

  let markdownContent = '';
  let codeFiles: Array<{ name: string; content: string; language: string }> = [];

  if (isMarkdown) {
    // Read the markdown file (for docs)
    const content = readRepoFile(item.path);
    if (content) {
      markdownContent = content;
    }
  } else if (isDirectory) {
    // Read all files in the directory
    const files = readDirectoryFiles(item.path, item.files);

    // Sort so README comes first, then alphabetically
    const sortedFiles = files.sort((a, b) => {
      const aIsReadme = a.path.toLowerCase().includes('readme');
      const bIsReadme = b.path.toLowerCase().includes('readme');

      if (aIsReadme && !bIsReadme) return -1;
      if (!aIsReadme && bIsReadme) return 1;
      return a.path.localeCompare(b.path);
    });

    // Include ALL files (including README) in tabs
    codeFiles = sortedFiles.map((f) => ({
      name: f.path,
      content: f.content,
      language: f.language,
    }));
  }

  // Get GitHub URL
  const githubUrl = `https://github.com/coinbase/x402/tree/main/${item.path}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Discovery
              </Button>
            </Link>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground transition-all border-2 border-border rounded-lg px-3 py-1.5 hover:border-foreground/40 hover:bg-accent shadow-sm"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {item.role && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/?role=${item.role}`}>
                    {item.role}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Content Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{item.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{item.description}</p>

          {/* Metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{item.type}</Badge>

            {item.language && (
              <Badge variant="secondary">{item.language}</Badge>
            )}

            {item.framework && (
              <Badge variant="secondary">{item.framework}</Badge>
            )}

            {item.role && (
              <Badge variant="outline">{item.role}</Badge>
            )}

            {item.complexity && (
              <Badge variant="outline">{item.complexity}</Badge>
            )}

            {item.features?.map((feature) => (
              <Badge key={feature} variant="outline">
                {feature}
              </Badge>
            ))}

            {item.networks?.map((network) => (
              <Badge key={network} variant="outline">
                {network}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Show markdown viewer only for direct .md files (docs), not directories */}
          {isMarkdown && markdownContent && (
            <MarkdownViewer content={markdownContent} />
          )}

          {/* Show code tabs for directories (includes README as first tab) */}
          {isDirectory && codeFiles.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>
                    {codeFiles.length} file{codeFiles.length !== 1 ? 's' : ''} in this example
                  </CardDescription>
                </CardHeader>
              </Card>
              <CodeViewer files={codeFiles} />
            </>
          )}

          {!isMarkdown && !isDirectory && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No content preview available. View on{' '}
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub
                </a>
              </p>
            </Card>
          )}
        </div>

        {/* Related Content */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-4">Related Content</h2>
          <p className="text-muted-foreground">
            Looking for more? Check out our other {item.language} examples or browse by{' '}
            <Link href={`/?role=${item.role}`} className="text-primary hover:underline">
              {item.role}
            </Link>{' '}
            content.
          </p>
        </div>
      </main>
    </div>
  );
}
