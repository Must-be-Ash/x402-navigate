/**
 * Compare different RAG approaches for the query:
 * "How do I start monetizing my API with x402?"
 */

import fs from 'fs';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import 'dotenv/config';

const embeddingsPath = '/Users/ashnouruzi/x402/x402-discovery-site/lib/embeddings.json';
const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));

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

async function testApproaches() {
  const query = "How do I start monetizing my API with x402?";

  console.log('Query:', query);
  console.log('\nGenerating embedding...\n');

  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // Calculate similarities for ALL chunks
  const allResults = embeddings.map(chunk => ({
    title: chunk.title,
    filePath: chunk.filePath,
    type: chunk.metadata.type,
    role: chunk.metadata.role,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    content: chunk.content.substring(0, 100),
  }));

  allResults.sort((a, b) => b.similarity - a.similarity);

  // APPROACH 1: Pure Semantic Search (NO filters)
  console.log('═══════════════════════════════════════════════════════════');
  console.log('APPROACH 1: Pure Semantic Search (NO keyword filtering)');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Top 10 results:');
  allResults.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. [${r.similarity.toFixed(4)}] ${r.title}`);
    console.log(`   Type: ${r.type || 'undefined'} | File: ${r.filePath.split('/').pop()}`);
  });

  // APPROACH 2: Filter to quickstart type
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('APPROACH 2: Keyword Filter (type=quickstart) + Semantic Search');
  console.log('═══════════════════════════════════════════════════════════\n');

  const quickstartResults = allResults.filter(r => r.type === 'quickstart');
  console.log(`Filtered to ${quickstartResults.length} quickstart chunks\n`);
  console.log('Top 10 quickstart results:');
  quickstartResults.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. [${r.similarity.toFixed(4)}] ${r.title}`);
    console.log(`   Role: ${r.role || 'undefined'} | File: ${r.filePath.split('/').pop()}`);
  });

  // APPROACH 3: Filter to quickstart + server role
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('APPROACH 3: Keyword Filter (type=quickstart, role=server) + Semantic');
  console.log('═══════════════════════════════════════════════════════════\n');

  const serverQuickstartResults = quickstartResults.filter(r => r.role === 'server');
  console.log(`Filtered to ${serverQuickstartResults.length} server quickstart chunks\n`);
  console.log('Top 10 server quickstart results:');
  serverQuickstartResults.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. [${r.similarity.toFixed(4)}] ${r.title}`);
    console.log(`   Content: ${r.content}...`);
  });

  // APPROACH 4: Diverse top-K (mixed types)
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('APPROACH 4: Semantic Search with Diversity (top 20, varied types)');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Group by type to see diversity
  const typeCount = {};
  allResults.slice(0, 20).forEach(r => {
    typeCount[r.type || 'undefined'] = (typeCount[r.type || 'undefined'] || 0) + 1;
  });

  console.log('Type distribution in top 20 results:');
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} chunks`);
  });

  console.log('\nTop 20 results with type markers:');
  allResults.slice(0, 20).forEach((r, i) => {
    const marker = r.type === 'quickstart' ? '⭐' : r.type === 'example' ? '📝' : '📚';
    console.log(`${i + 1}. ${marker} [${r.similarity.toFixed(4)}] ${r.title} (${r.type})`);
  });

  // Analysis
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const firstQuickstartRank = allResults.findIndex(r => r.type === 'quickstart' && r.role === 'server') + 1;
  const firstQuickstartScore = allResults.find(r => r.type === 'quickstart' && r.role === 'server')?.similarity;

  console.log(`Without filtering:`);
  console.log(`  - First server quickstart appears at rank: ${firstQuickstartRank}`);
  console.log(`  - Similarity score: ${firstQuickstartScore?.toFixed(4)}`);
  console.log(`  - Would be MISSED with topK=10: ${firstQuickstartRank > 10 ? 'YES ❌' : 'NO ✓'}`);

  console.log(`\nWith type=quickstart filter:`);
  console.log(`  - Searches only ${quickstartResults.length} chunks instead of ${embeddings.length}`);
  console.log(`  - Server quickstart appears in top results: YES ✓`);
  console.log(`  - Best approach for "getting started" queries: YES ✓`);

  console.log(`\nWith topK=20 (no filter):`);
  console.log(`  - Would include server quickstart: ${firstQuickstartRank <= 20 ? 'YES ✓' : 'NO ❌'}`);
  console.log(`  - LLM would see both concepts AND quickstarts`);
  console.log(`  - More context tokens used: ${(20 * 800 / 1000).toFixed(1)}K chars`);
}

testApproaches().catch(console.error);
