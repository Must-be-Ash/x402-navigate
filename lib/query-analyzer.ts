/**
 * Query Intent Analyzer
 *
 * Analyzes user queries to detect intent and extract metadata for smart RAG filtering.
 * Identifies when users want examples vs conceptual documentation and extracts
 * relevant attributes like role, language, and framework.
 */

export interface QueryIntent {
  wantsExamples: boolean;
  role?: 'client' | 'server' | 'facilitator';
  language?: string;
  framework?: string;
  keywords: string[];
}

/**
 * Analyze a user query to determine intent and extract metadata
 */
export function analyzeQuery(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();

  // Detect if user wants example code
  const wantsExamples = detectExampleIntent(lowerQuery);

  // Extract role (client, server, facilitator)
  const role = extractRole(lowerQuery);

  // Extract programming language
  const language = extractLanguage(lowerQuery);

  // Extract framework/library
  const framework = extractFramework(lowerQuery);

  // Extract keywords for additional context
  const keywords = extractKeywords(query);

  return {
    wantsExamples,
    role,
    language,
    framework,
    keywords,
  };
}

/**
 * Detect if query is seeking example code
 */
function detectExampleIntent(query: string): boolean {
  const exampleIndicators = [
    // Direct example requests
    /\b(show|give|provide|find|get|see)\s+(me\s+)?(an?\s+)?example/i,
    /\bexample\s+(code|implementation|of)/i,
    /\bcode\s+(example|sample|snippet)/i,
    /\bsample\s+(code|implementation)/i,

    // Implementation requests
    /\bhow\s+to\s+(implement|build|create|make|use|set\s*up)/i,
    /\bhow\s+(do|can)\s+i\s+(implement|build|create|make|use)/i,

    // Tutorial/guide requests
    /\bquick\s*start/i,
    /\bget(ting)?\s+started/i,
    /\btutorial/i,
    /\bwalkthrough/i,

    // Working code requests
    /\bworking\s+(code|example)/i,
    /\bcode\s+that\s+works/i,

    // Standalone "example" keyword (e.g., "TypeScript client example")
    /\bexamples?\b/i,
  ];

  return exampleIndicators.some(pattern => pattern.test(query));
}

/**
 * Extract role from query (client, server, facilitator)
 */
function extractRole(query: string): QueryIntent['role'] {
  // Client indicators
  if (/\b(client|buyer|consumer|payer|making?\s+payment|pay(ing)?)/i.test(query)) {
    return 'client';
  }

  // Server indicators
  if (/\b(server|seller|provider|merchant|accept(ing)?\s+payment|receiving?\s+payment)/i.test(query)) {
    return 'server';
  }

  // Facilitator indicators
  if (/\bfacilitator/i.test(query)) {
    return 'facilitator';
  }

  return undefined;
}

/**
 * Extract programming language from query
 */
function extractLanguage(query: string): string | undefined {
  const languagePatterns: Record<string, RegExp> = {
    typescript: /\b(typescript|ts|javascript|js|node(\.?js)?)\b/i,
    go: /\b(go|golang)\b/i,
    python: /\bpython\b/i,
    java: /\bjava\b/i,
  };

  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(query)) {
      return lang;
    }
  }

  return undefined;
}

/**
 * Extract framework/library from query
 */
function extractFramework(query: string): string | undefined {
  const frameworkPatterns: Record<string, RegExp> = {
    fetch: /\bfetch(\s+api)?/i,
    axios: /\baxios/i,
    express: /\bexpress(\.?js)?/i,
    hono: /\bhono/i,
    nextjs: /\bnext(\.?js)?/i,
  };

  for (const [framework, pattern] of Object.entries(frameworkPatterns)) {
    if (pattern.test(query)) {
      return framework;
    }
  }

  return undefined;
}

/**
 * Extract meaningful keywords from query
 */
function extractKeywords(query: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did',
    'show', 'give', 'provide', 'find', 'get', 'see',
    'me', 'my', 'i', 'you', 'your',
    'how', 'what', 'when', 'where', 'why', 'which',
    'can', 'could', 'would', 'should',
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[^a-z0-9]/g, '')) // Remove punctuation
    .filter(word => word.length > 2 && !stopWords.has(word));
}
