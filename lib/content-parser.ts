import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { TaxonomyData, ContentItem, FileContent } from './types';

// Path to the parent x402 repo
const X402_REPO_PATH = path.join(process.cwd(), '..');

/**
 * Load the taxonomy data
 */
export function loadTaxonomy(): TaxonomyData {
  const taxonomyPath = path.join(process.cwd(), 'content-taxonomy.json');
  const content = fs.readFileSync(taxonomyPath, 'utf-8');
  return JSON.parse(content) as TaxonomyData;
}

/**
 * Read a file from the x402 repo
 */
export function readRepoFile(relativePath: string): string | null {
  try {
    const fullPath = path.join(X402_REPO_PATH, relativePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      return null;
    }
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${relativePath}:`, error);
    return null;
  }
}

/**
 * Read multiple files from a directory
 */
export function readDirectoryFiles(relativePath: string, fileNames?: string[]): FileContent[] {
  const fullPath = path.join(X402_REPO_PATH, relativePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`Directory not found: ${fullPath}`);
    return [];
  }

  const files: FileContent[] = [];

  // If specific files are provided, read only those
  if (fileNames && fileNames.length > 0) {
    for (const fileName of fileNames) {
      const filePath = path.join(fullPath, fileName);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        files.push({
          path: fileName,
          content,
          language: getLanguageFromExtension(fileName)
        });
      }
    }
  } else {
    // Otherwise, read all files in the directory
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && !entry.name.startsWith('.')) {
        const content = fs.readFileSync(path.join(fullPath, entry.name), 'utf-8');
        files.push({
          path: entry.name,
          content,
          language: getLanguageFromExtension(entry.name)
        });
      }
    }
  }

  return files;
}

/**
 * Get language identifier from file extension
 */
function getLanguageFromExtension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const languageMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.go': 'go',
    '.py': 'python',
    '.md': 'markdown',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.sh': 'bash',
    '.rs': 'rust',
    '.java': 'java',
  };
  return languageMap[ext] || 'text';
}

/**
 * Parse markdown file with frontmatter
 */
export function parseMarkdown(content: string) {
  const { data, content: body } = matter(content);
  return { frontmatter: data, body };
}

/**
 * Build the complete content index with file contents
 */
export function buildContentIndex(): ContentItem[] {
  const taxonomy = loadTaxonomy();
  const contentItems: ContentItem[] = [];

  for (const item of taxonomy.content_map) {
    const enhancedItem = { ...item };

    // If it's a single file (like a markdown doc), read it directly
    if (item.path.endsWith('.md')) {
      const content = readRepoFile(item.path);
      if (content) {
        enhancedItem.content = content;
      }
    }

    // If it has specific files listed, read them
    if (item.files && item.files.length > 0) {
      const dirPath = item.path;
      const fileContents = readDirectoryFiles(dirPath, item.files);

      // Store the main README as content
      const readme = fileContents.find(f => f.path.toLowerCase().includes('readme'));
      if (readme) {
        enhancedItem.content = readme.content;
      }
    }

    contentItems.push(enhancedItem);
  }

  return contentItems;
}

/**
 * Get a single content item by ID
 */
export function getContentItem(id: string): ContentItem | null {
  const items = buildContentIndex();
  return items.find(item => item.id === id) || null;
}

/**
 * Filter content items based on criteria
 */
export function filterContent(
  items: ContentItem[],
  filters: {
    role?: string;
    language?: string;
    framework?: string;
    complexity?: string;
    features?: string[];
    type?: string;
    search?: string;
  }
): ContentItem[] {
  return items.filter(item => {
    // Filter by role
    if (filters.role && item.role !== filters.role) {
      return false;
    }

    // Filter by language
    if (filters.language && filters.language !== 'any' && item.language !== filters.language) {
      return false;
    }

    // Filter by framework
    if (filters.framework && item.framework !== filters.framework) {
      return false;
    }

    // Filter by complexity
    if (filters.complexity && item.complexity !== filters.complexity) {
      return false;
    }

    // Filter by features (item must have ALL requested features)
    if (filters.features && filters.features.length > 0) {
      if (!item.features || !filters.features.every(f => item.features?.includes(f))) {
        return false;
      }
    }

    // Filter by type
    if (filters.type && item.type !== filters.type) {
      return false;
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(searchLower);
      const matchesDescription = item.description?.toLowerCase().includes(searchLower);
      const matchesPath = item.path.toLowerCase().includes(searchLower);

      if (!matchesTitle && !matchesDescription && !matchesPath) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get content grouped by type
 */
export function groupContentByType(items: ContentItem[]): Record<string, ContentItem[]> {
  const grouped: Record<string, ContentItem[]> = {};

  for (const item of items) {
    if (!grouped[item.type]) {
      grouped[item.type] = [];
    }
    grouped[item.type].push(item);
  }

  return grouped;
}

/**
 * Get content grouped by complexity
 */
export function groupContentByComplexity(items: ContentItem[]): Record<string, ContentItem[]> {
  const grouped: Record<string, ContentItem[]> = {
    beginner: [],
    intermediate: [],
    advanced: [],
  };

  for (const item of items) {
    const complexity = item.complexity || 'intermediate';
    grouped[complexity].push(item);
  }

  return grouped;
}
