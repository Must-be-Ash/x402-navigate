/**
 * Content URL Mapper
 *
 * Maps embedding file paths to user-facing content URLs using the content taxonomy.
 * Converts paths like "examples/typescript/clients/fetch/README.md" to URLs like "/content/ts-client-fetch"
 */

import { loadTaxonomy } from './content-parser';
import type { TaxonomyData, ContentItem } from './types';

export class ContentUrlMapper {
  private pathToIdMap: Map<string, string>;
  private idToItemMap: Map<string, ContentItem>;

  constructor() {
    this.pathToIdMap = new Map();
    this.idToItemMap = new Map();
    this.buildMapping();
  }

  /**
   * Build mapping from taxonomy data
   */
  private buildMapping(): void {
    const taxonomy: TaxonomyData = loadTaxonomy();

    for (const item of taxonomy.content_map) {
      // Store item by ID for quick lookup
      this.idToItemMap.set(item.id, item);

      // Normalize path (remove leading/trailing slashes)
      const normalizedPath = this.normalizePath(item.path);

      // Map the normalized path to ID
      this.pathToIdMap.set(normalizedPath, item.id);

      // Also map various path variations for robustness
      this.pathToIdMap.set(item.path, item.id);

      // Map with/without "content/" prefix
      if (item.path.startsWith('content/')) {
        const withoutContent = item.path.replace(/^content\//, '');
        this.pathToIdMap.set(withoutContent, item.id);
      } else {
        const withContent = `content/${item.path}`;
        this.pathToIdMap.set(withContent, item.id);
      }

      // Map with/without trailing slash
      const withTrailingSlash = normalizedPath + '/';
      this.pathToIdMap.set(withTrailingSlash, item.id);
    }
  }

  /**
   * Normalize a path by removing leading/trailing slashes and extra slashes
   */
  private normalizePath(path: string): string {
    return path
      .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
      .replace(/\/+/g, '/');      // Collapse multiple slashes
  }

  /**
   * Convert an embedding file path to a user-facing content URL
   *
   * @param filePath - Path from embedding (e.g., "examples/typescript/clients/fetch/README.md")
   * @returns URL path (e.g., "/content/ts-client-fetch") or null if not found
   */
  getContentUrl(filePath: string): string | null {
    // Try exact match first
    let id = this.pathToIdMap.get(filePath);

    if (!id) {
      // Try normalized path
      const normalized = this.normalizePath(filePath);
      id = this.pathToIdMap.get(normalized);
    }

    if (!id) {
      // Try directory path (remove filename)
      const dirPath = this.getDirectoryPath(filePath);
      id = this.pathToIdMap.get(dirPath);
    }

    if (!id) {
      // Try directory path normalized
      const dirPathNormalized = this.normalizePath(this.getDirectoryPath(filePath));
      id = this.pathToIdMap.get(dirPathNormalized);
    }

    return id ? `/content/${id}` : null;
  }

  /**
   * Get the directory path from a file path
   *
   * @param filePath - Full file path
   * @returns Directory path without filename
   */
  private getDirectoryPath(filePath: string): string {
    const parts = filePath.split('/');
    // Remove the last part (filename)
    parts.pop();
    return parts.join('/');
  }

  /**
   * Get a human-readable title for a content item
   *
   * @param filePath - Path from embedding
   * @returns Title or null if not found
   */
  getTitle(filePath: string): string | null {
    const url = this.getContentUrl(filePath);
    if (!url) return null;

    // Extract ID from URL ("/content/ts-client-fetch" → "ts-client-fetch")
    const id = url.replace(/^\/content\//, '');
    const item = this.idToItemMap.get(id);

    return item?.title || null;
  }

  /**
   * Get the full content item for a file path
   *
   * @param filePath - Path from embedding
   * @returns ContentItem or null if not found
   */
  getContentItem(filePath: string): ContentItem | null {
    const url = this.getContentUrl(filePath);
    if (!url) return null;

    const id = url.replace(/^\/content\//, '');
    return this.idToItemMap.get(id) || null;
  }
}

// Singleton instance for efficient reuse
export const contentUrlMapper = new ContentUrlMapper();
