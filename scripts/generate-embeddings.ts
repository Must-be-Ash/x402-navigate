/**
 * Script to generate embeddings for all x402 content using Vercel AI SDK
 * This will create a local JSON file with embeddings that can be used for RAG
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
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

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Extract metadata from file path
function extractMetadata(filePath: string): ContentChunk['metadata'] {
  const metadata: ContentChunk['metadata'] = {};

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

  return metadata;
}

async function main() {
  console.log('🔍 Finding all markdown files...');
  const contentDir = path.join(__dirname, '..', 'content');
  const markdownFiles = getAllMarkdownFiles(contentDir);
  console.log(`Found ${markdownFiles.length} markdown files`);

  console.log('\n📄 Processing files and creating chunks...');
  const allChunks: ContentChunk[] = [];

  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(contentDir, filePath);
    const fileName = path.basename(filePath, '.md');

    // Extract title from first heading or use filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : fileName;

    const chunks = splitIntoChunks(content);
    const metadata = extractMetadata(filePath);

    chunks.forEach((chunk, index) => {
      allChunks.push({
        id: `${relativePath.replace(/\//g, '_').replace('.md', '')}_chunk_${index}`,
        title: index === 0 ? title : `${title} (part ${index + 1})`,
        filePath: relativePath,
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
        model: openai.embedding('text-embedding-3-small'),
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
