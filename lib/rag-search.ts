/**
 * RAG search utilities for finding relevant x402 content using embeddings
 */

import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import embeddingsData from './embeddings.json';

interface EmbeddedChunk {
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
  embedding: number[];
}

// Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Search for relevant content chunks using semantic similarity
 */
export async function searchContent(
  query: string,
  options: {
    topK?: number;
    minSimilarity?: number;
    filterBy?: {
      role?: string;
      language?: string;
      type?: string;
    };
  } = {}
): Promise<Array<EmbeddedChunk & { similarity: number }>> {
  const { topK = 5, minSimilarity = 0.5, filterBy } = options;

  // Generate embedding for the query
  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // Load embeddings
  const chunks = embeddingsData as EmbeddedChunk[];

  // Filter by metadata if specified
  let filteredChunks = chunks;
  if (filterBy) {
    filteredChunks = chunks.filter(chunk => {
      if (filterBy.role && chunk.metadata.role !== filterBy.role) return false;
      if (filterBy.language && chunk.metadata.language !== filterBy.language) return false;
      if (filterBy.type && chunk.metadata.type !== filterBy.type) return false;
      return true;
    });
  }

  // Calculate similarities
  const results = filteredChunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by similarity and filter by minimum threshold
  return results
    .filter(r => r.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Build context string from search results for LLM
 */
export function buildContext(results: Array<EmbeddedChunk & { similarity: number }>): string {
  if (results.length === 0) {
    return 'No relevant content found in the x402 documentation.';
  }

  const contextParts = results.map((result, index) => {
    const metadata = [];
    if (result.metadata.role) metadata.push(`Role: ${result.metadata.role}`);
    if (result.metadata.language) metadata.push(`Language: ${result.metadata.language}`);
    if (result.metadata.type) metadata.push(`Type: ${result.metadata.type}`);

    return `
[Source ${index + 1}: ${result.title}${metadata.length > 0 ? ` (${metadata.join(', ')})` : ''}]
${result.content}
`.trim();
  });

  return contextParts.join('\n\n---\n\n');
}

/**
 * Search and return formatted context for RAG
 */
export async function getRelevantContext(
  query: string,
  options?: Parameters<typeof searchContent>[1]
): Promise<string> {
  const results = await searchContent(query, options);
  return buildContext(results);
}
