/**
 * Test query intent detection for "How do I start monetizing my API with x402?"
 */

import { analyzeQuery } from './lib/query-analyzer.js';

const queries = [
  "How do I start monetizing my API with x402?",
  "Show me an example of a TypeScript server",
  "Getting started with x402",
  "How can I use x402 with miniapps?",
  "Quick start guide for sellers",
];

console.log('=== QUERY INTENT DETECTION TESTS ===\n');

queries.forEach(query => {
  const intent = analyzeQuery(query);
  console.log(`Query: "${query}"`);
  console.log('Intent:', JSON.stringify(intent, null, 2));
  console.log('---\n');
});
