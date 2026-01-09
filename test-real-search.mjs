/**
 * Test script to run actual semantic search for "How do I start monetizing my API with x402?"
 */

import fs from 'fs';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import 'dotenv/config';

const embeddingsPath = '/Users/ashnouruzi/x402/x402-discovery-site/lib/embeddings.json';
const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));

// Cosine similarity between two vectors
function cosineSimilarity(a, b) {
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

async function testSearch() {
  const query = "How do I start monetizing my API with x402?";

  console.log('Query:', query);
  console.log('\nGenerating embedding for query...');

  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  console.log('Calculating similarities...');

  // Calculate similarities for all chunks
  const results = embeddings.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by similarity
  results.sort((a, b) => b.similarity - a.similarity);

  console.log('\n=== TOP 15 RESULTS ===');
  results.slice(0, 15).forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.title}`);
    console.log(`   Similarity: ${result.similarity.toFixed(4)}`);
    console.log(`   File: ${result.filePath}`);
    console.log(`   Type: ${result.metadata.type || 'undefined'}`);
    console.log(`   Role: ${result.metadata.role || 'undefined'}`);
    console.log(`   Content preview: ${result.content.substring(0, 100)}...`);
  });

  // Find where server quickstart ranks
  console.log('\n=== SERVER QUICKSTART RANKINGS ===');
  const serverQuickstartResults = results
    .map((r, index) => ({ ...r, rank: index + 1 }))
    .filter(r => r.filePath.includes('quickstart-for-sellers'));

  console.log(`Found ${serverQuickstartResults.length} server quickstart chunks`);
  console.log('\nTop 5 server quickstart chunks:');
  serverQuickstartResults.slice(0, 5).forEach(r => {
    console.log(`\n  Rank: ${r.rank}`);
    console.log(`  Similarity: ${r.similarity.toFixed(4)}`);
    console.log(`  Title: ${r.title}`);
    console.log(`  Chunk: ${r.chunkIndex}`);
  });
}

testSearch().catch(console.error);
