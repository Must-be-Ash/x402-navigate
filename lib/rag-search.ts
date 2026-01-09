/**
 * RAG search utilities for finding relevant x402 content using embeddings
 */

import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import embeddingsData from './embeddings.json';
import { analyzeQuery, QueryIntent } from './query-analyzer';
import { contentUrlMapper } from './content-url-mapper';

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
    model: openai.embedding('text-embedding-3-large'),
    value: query,
  });

  // Load embeddings
  const chunks = embeddingsData as EmbeddedChunk[];
  console.log('[Search] Total chunks loaded:', chunks.length);

  // Filter by metadata if specified
  let filteredChunks = chunks;
  if (filterBy) {
    console.log('[Search] Filtering with:', filterBy);
    filteredChunks = chunks.filter(chunk => {
      if (filterBy.role && chunk.metadata.role !== filterBy.role) return false;
      if (filterBy.language && chunk.metadata.language !== filterBy.language) return false;
      if (filterBy.type && chunk.metadata.type !== filterBy.type) return false;
      return true;
    });
    console.log('[Search] After filtering:', filteredChunks.length, 'chunks');

    // Debug: Show sample of filtered chunks
    if (filteredChunks.length > 0) {
      console.log('[Search] Sample filtered chunk:', {
        title: filteredChunks[0].title,
        metadata: filteredChunks[0].metadata,
        filePath: filteredChunks[0].filePath,
      });
    } else {
      // Debug: Show what metadata values actually exist
      const uniqueTypes = [...new Set(chunks.map(c => c.metadata.type).filter(Boolean))];
      const uniqueRoles = [...new Set(chunks.map(c => c.metadata.role).filter(Boolean))];
      const uniqueLangs = [...new Set(chunks.map(c => c.metadata.language).filter(Boolean))];
      console.log('[Search] Available metadata values:');
      console.log('  - Types:', uniqueTypes);
      console.log('  - Roles:', uniqueRoles);
      console.log('  - Languages:', uniqueLangs);
    }
  }

  // Calculate similarities
  const results = filteredChunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by similarity first
  const sortedResults = results.sort((a, b) => b.similarity - a.similarity);

  // Log top 3 matches before filtering (for debugging)
  if (sortedResults.length > 0) {
    console.log('[Search] Top 3 matches before threshold filter:');
    sortedResults.slice(0, 3).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} (similarity: ${r.similarity.toFixed(4)})`);
    });
  }

  // Filter by minimum threshold
  return sortedResults
    .filter(r => r.similarity >= minSimilarity)
    .slice(0, topK);
}

/**
 * Build context string from search results for LLM with example links
 */
export function buildContextWithLinks(
  results: Array<EmbeddedChunk & { similarity: number }>,
  intent?: QueryIntent
): string {
  if (results.length === 0) {
    return 'No relevant content found in the x402 documentation.';
  }

  const contextParts = results.map((result, index) => {
    const metadata = [];
    if (result.metadata.role) metadata.push(`Role: ${result.metadata.role}`);
    if (result.metadata.language) metadata.push(`Language: ${result.metadata.language}`);
    if (result.metadata.type) metadata.push(`Type: ${result.metadata.type}`);

    // Generate content URL for ALL content types (examples, guides, concepts, references, etc.)
    let urlInfo = '';
    const url = contentUrlMapper.getContentUrl(result.filePath);
    const title = contentUrlMapper.getTitle(result.filePath) || result.title;

    if (url) {
      // Format link based on content type
      const linkText = result.metadata.type === 'example'
        ? `Full example: ${title} - ${url}`
        : `Read more: ${title} - ${url}`;
      urlInfo = `\n${linkText}`;
    }

    return `
[Source ${index + 1}: ${result.title}${metadata.length > 0 ? ` (${metadata.join(', ')})` : ''}]${urlInfo}
${result.content}
`.trim();
  });

  return contextParts.join('\n\n---\n\n');
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use buildContextWithLinks instead
 */
export function buildContext(results: Array<EmbeddedChunk & { similarity: number }>): string {
  return buildContextWithLinks(results);
}

/**
 * Search and return formatted context for RAG with intelligent filtering
 */
export async function getRelevantContext(
  query: string,
  options?: Parameters<typeof searchContent>[1]
): Promise<string> {
  // Analyze query intent
  const intent = analyzeQuery(query);
  console.log('[RAG Search] Query intent:', JSON.stringify(intent, null, 2));

  // Build dynamic filter based on intent
  const filter: {
    role?: string;
    language?: string;
    type?: string;
  } = { ...options?.filterBy };

  // Prioritize quickstart guides for getting started queries
  if (intent.wantsQuickstart) {
    filter.type = 'quickstart';

    // Apply additional filters if detected
    if (intent.role) filter.role = intent.role;
    if (intent.language) filter.language = intent.language;
  } else if (intent.wantsExamples) {
    // User wants examples - apply type filter
    filter.type = 'example';

    // Apply additional filters if detected
    if (intent.role) filter.role = intent.role;
    if (intent.language) filter.language = intent.language;
  }

  console.log('[RAG Search] Applying filter:', JSON.stringify(filter, null, 2));

  // First pass: Try with strict filters
  let results = await searchContent(query, {
    ...options,
    filterBy: filter,
  });

  console.log('[RAG Search] Found', results.length, 'results with strict filter');
  if (results.length > 0) {
    console.log('[RAG Search] Top result:', {
      title: results[0].title,
      filePath: results[0].filePath,
      metadata: results[0].metadata,
      similarity: results[0].similarity,
    });
  } else {
    console.log('[RAG Search] No results above minSimilarity threshold. Check if threshold is too high.');
  }

  // Fallback: If no results with strict filters, try relaxing constraints
  if (results.length === 0 && intent.wantsQuickstart) {
    // Keep type=quickstart but remove role/language filters
    console.log('[RAG Search] No results with strict filters, trying with type=quickstart only');
    results = await searchContent(query, {
      ...options,
      filterBy: { type: 'quickstart' },
    });
    console.log('[RAG Search] Found', results.length, 'results with relaxed filter');
  } else if (results.length === 0 && intent.wantsExamples) {
    // Keep type=example but remove role/language filters
    console.log('[RAG Search] No results with strict filters, trying with type=example only');
    results = await searchContent(query, {
      ...options,
      filterBy: { type: 'example' },
    });
    console.log('[RAG Search] Found', results.length, 'results with relaxed filter');
  }

  // Build context with links
  return buildContextWithLinks(results, intent);
}
