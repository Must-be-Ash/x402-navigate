/**
 * Script to generate embeddings for all x402 content using Vercel AI SDK
 * This will create a local JSON file with embeddings that can be used for RAG
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { TaxonomyData, ContentItem } from '../lib/types.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ContentChunk {
  id: string;
  title: string;
  filePath: string;
  content: string;
  chunkIndex: number;
  metadata: {
    type?: string;
    role?: string;
    language?: string;
    framework?: string;
    complexity?: string;
  };
}

interface EmbeddedChunk extends ContentChunk {
  embedding: number[];
}

// Read all markdown files from content directory
function getAllMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Split content into chunks (to fit within embedding token limits)
function splitIntoChunks(content: string, maxChunkSize = 1000): string[] {
  const chunks: string[] = [];
  const paragraphs = content.split('\n\n');
  let currentChunk = '';

  for (let paragraph of paragraphs) {
    // If a single paragraph is too large, split it by lines
    while (paragraph.length > maxChunkSize) {
      const splitPoint = paragraph.lastIndexOf('\n', maxChunkSize);
      if (splitPoint > 0) {
        const part = paragraph.substring(0, splitPoint);
        if (currentChunk && (currentChunk + '\n\n' + part).length > maxChunkSize) {
          chunks.push(currentChunk.trim());
          currentChunk = part;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + part;
        }
        paragraph = paragraph.substring(splitPoint + 1);
      } else {
        // Force split if no newline found
        const part = paragraph.substring(0, maxChunkSize);
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        chunks.push(part.trim());
        paragraph = paragraph.substring(maxChunkSize);
      }
    }

    // Add remaining paragraph
    if (paragraph) {
      if ((currentChunk + '\n\n' + paragraph).length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Load taxonomy for accurate content type mapping
function loadTaxonomy(): TaxonomyData {
  const taxonomyPath = path.join(__dirname, '..', 'content-taxonomy.json');
  const taxonomyContent = fs.readFileSync(taxonomyPath, 'utf-8');
  return JSON.parse(taxonomyContent);
}

// Build a map from file paths to taxonomy items for quick lookup
function buildTaxonomyPathMap(taxonomy: TaxonomyData): Map<string, ContentItem> {
  const pathMap = new Map<string, ContentItem>();

  for (const item of taxonomy.content_map) {
    // Store multiple path variations for matching
    const paths = [
      item.path,
      item.path.replace(/^content\//, ''), // without content/ prefix
      `content/${item.path}`, // with content/ prefix
    ];

    // For directory paths (examples), also match any file within
    if (!item.path.endsWith('.md')) {
      paths.push(`${item.path}/README.md`);
      paths.push(`content/${item.path}/README.md`);
    }

    for (const p of paths) {
      pathMap.set(p, item);
    }
  }

  return pathMap;
}

// Extract metadata using taxonomy for accurate type information
function extractMetadata(
  filePath: string,
  relativePath: string,
  sourceDir: string,
  taxonomyMap: Map<string, ContentItem>
): ContentChunk['metadata'] {
  const metadata: ContentChunk['metadata'] = {};

  // First, try to match with taxonomy for accurate types
  const taxonomyItem = taxonomyMap.get(relativePath) ||
                       taxonomyMap.get(relativePath.replace(/\.md$/, '')) ||
                       taxonomyMap.get(`content/${relativePath}`);

  if (taxonomyItem) {
    // Use taxonomy data for accurate metadata
    metadata.type = taxonomyItem.type;
    if (taxonomyItem.role) metadata.role = taxonomyItem.role;
    if (taxonomyItem.language) metadata.language = taxonomyItem.language;
    if (taxonomyItem.framework) metadata.framework = taxonomyItem.framework;
    if (taxonomyItem.complexity) metadata.complexity = taxonomyItem.complexity;
  } else {
    // Fallback to path-based detection for x402-docs and unmapped content
    if (filePath.includes('x402-docs/')) {
      metadata.type = 'documentation';

      // Extract specific doc types from x402-docs
      if (filePath.includes('quickstart')) metadata.type = 'quickstart';
      else if (filePath.includes('faq')) metadata.type = 'faq';
      else if (filePath.includes('welcome')) metadata.type = 'overview';
      else if (filePath.includes('how-it-works')) metadata.type = 'concept';
      else if (filePath.includes('migration')) metadata.type = 'guide';
      else if (filePath.includes('mcp-server')) metadata.type = 'integration';
      else if (filePath.includes('bazaar')) metadata.type = 'integration';
      else if (filePath.includes('miniapps')) metadata.type = 'integration';

      // Check for role-specific docs
      if (filePath.includes('facilitator')) metadata.role = 'facilitator';
      else if (filePath.includes('client') || filePath.includes('buyer')) metadata.role = 'client';
      else if (filePath.includes('server') || filePath.includes('seller')) metadata.role = 'server';
    } else {
      // Path-based detection for unmapped content files
      if (filePath.includes('/typescript/')) metadata.language = 'typescript';
      else if (filePath.includes('/go/')) metadata.language = 'go';
      else if (filePath.includes('/python/')) metadata.language = 'python';
      else if (filePath.includes('/java/')) metadata.language = 'java';

      if (filePath.includes('/client')) metadata.role = 'client';
      else if (filePath.includes('/server')) metadata.role = 'server';
      else if (filePath.includes('/facilitator')) metadata.role = 'facilitator';

      if (filePath.includes('/quickstart') || filePath.includes('/getting-started')) metadata.type = 'quickstart';
      else if (filePath.includes('/examples/')) metadata.type = 'example';
      else if (filePath.includes('/specs/')) metadata.type = 'spec';
      else if (filePath.includes('/docs/')) metadata.type = 'guide';
    }
  }

  return metadata;
}

async function main() {
  console.log('🔍 Finding all markdown files...');

  // Load taxonomy for accurate type mapping
  console.log('📚 Loading taxonomy...');
  const taxonomy = loadTaxonomy();
  const taxonomyMap = buildTaxonomyPathMap(taxonomy);
  console.log(`Loaded ${taxonomy.content_map.length} items from taxonomy`);

  // Scan both content and x402-docs directories
  const contentDir = path.join(__dirname, '..', 'content');
  const docsDir = path.join(__dirname, '..', 'x402-docs');

  const contentFiles = getAllMarkdownFiles(contentDir);
  const docFiles = fs.existsSync(docsDir) ? getAllMarkdownFiles(docsDir) : [];

  console.log(`Found ${contentFiles.length} markdown files in content/`);
  console.log(`Found ${docFiles.length} markdown files in x402-docs/`);
  console.log(`Total: ${contentFiles.length + docFiles.length} markdown files`);

  console.log('\n📄 Processing files and creating chunks...');
  const allChunks: ContentChunk[] = [];

  // Process content directory files
  for (const filePath of contentFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(contentDir, filePath);
    const fileName = path.basename(filePath, '.md');

    // Extract title from first heading or use filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : fileName;

    // Use smaller chunks for very large files to avoid token limits
    const isLargeFile = content.length > 500000; // > 500KB
    const chunkSize = isLargeFile ? 500 : 800; // Smaller chunks for large files, and reduced default
    const chunks = splitIntoChunks(content, chunkSize);
    const metadata = extractMetadata(filePath, relativePath, 'content', taxonomyMap);

    chunks.forEach((chunk, index) => {
      allChunks.push({
        id: `content_${relativePath.replace(/\//g, '_').replace('.md', '')}_chunk_${index}`,
        title: index === 0 ? title : `${title} (part ${index + 1})`,
        filePath: `content/${relativePath}`,
        content: chunk,
        chunkIndex: index,
        metadata,
      });
    });
  }

  // Process x402-docs directory files
  for (const filePath of docFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(docsDir, filePath);
    const fileNameWithoutExt = path.basename(filePath, '.md');

    // Extract title from first heading or use filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : fileNameWithoutExt.replace(/-/g, ' ');

    // Use smaller chunks for very large files to avoid token limits
    const isLargeFile = content.length > 500000; // > 500KB
    const chunkSize = isLargeFile ? 500 : 800; // Smaller chunks for large files, and reduced default
    const chunks = splitIntoChunks(content, chunkSize);
    const metadata = extractMetadata(filePath, relativePath, 'x402-docs', taxonomyMap);

    chunks.forEach((chunk, index) => {
      allChunks.push({
        id: `docs_${relativePath.replace(/\//g, '_').replace('.md', '')}_chunk_${index}`,
        title: index === 0 ? title : `${title} (part ${index + 1})`,
        filePath: `x402-docs/${relativePath}`,
        content: chunk,
        chunkIndex: index,
        metadata,
      });
    });
  }

  console.log(`Created ${allChunks.length} chunks`);

  console.log('\n🤖 Generating embeddings with OpenAI via Vercel AI SDK...');
  const embeddedChunks: EmbeddedChunk[] = [];
  const batchSize = 100;

  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allChunks.length / batchSize)}...`);

    try {
      const { embeddings } = await embedMany({
        model: openai.embedding('text-embedding-3-large'),
        values: batch.map(chunk => `Title: ${chunk.title}\n\n${chunk.content}`),
      });

      batch.forEach((chunk, idx) => {
        embeddedChunks.push({
          ...chunk,
          embedding: embeddings[idx],
        });
      });

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing batch ${i}:`, error);
      throw error;
    }
  }

  console.log('\n💾 Saving embeddings to file...');
  const outputPath = path.join(__dirname, '..', 'lib', 'embeddings.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(embeddedChunks, null, 2));

  console.log(`✅ Done! Saved ${embeddedChunks.length} embedded chunks to ${outputPath}`);
  console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
