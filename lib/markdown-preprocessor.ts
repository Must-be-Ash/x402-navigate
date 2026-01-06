/**
 * Preprocess markdown content to handle GitBook-specific syntax
 */

interface TabSection {
  title: string;
  content: string;
}

/**
 * Convert GitBook tabs syntax to markdown tab sections
 * Example input:
 *   {% tabs %}
 *   {% tab title="Express" %}
 *   Content here
 *   {% endtab %}
 *   {% endtabs %}
 *
 * Output: Grouped sections with titles
 */
export function preprocessGitBookSyntax(markdown: string): string {
  let processed = markdown;

  // Remove {% tabs %} and {% endtabs %}
  processed = processed.replace(/\{%\s*tabs\s*%\}/g, '\n');
  processed = processed.replace(/\{%\s*endtabs\s*%\}/g, '\n');

  // Convert {% tab title="Name" %} ... {% endtab %} to markdown sections
  const tabPattern = /\{%\s*tab\s+title="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endtab\s*%\}/g;

  processed = processed.replace(tabPattern, (match, title, content) => {
    // Convert to a collapsible section or just a heading
    return `\n### ${title}\n\n${content.trim()}\n`;
  });

  // Handle hint/callout blocks: {% hint style="info" %}
  const hintPattern = /\{%\s*hint\s+style="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g;

  processed = processed.replace(hintPattern, (match, style, content) => {
    const emojiMap: Record<string, string> = {
      'info': 'ℹ️',
      'warning': '⚠️',
      'danger': '🚫',
      'success': '✅',
      'tip': '💡'
    };
    const emoji = emojiMap[style] || 'ℹ️';

    return `\n> ${emoji} **${style.toUpperCase()}**\n>\n${content.trim().split('\n').map((line: string) => `> ${line}`).join('\n')}\n`;
  });

  // Handle content-ref blocks: {% content-ref url="..." %}
  processed = processed.replace(/\{%\s*content-ref\s+url="([^"]+)"\s*%\}[\s\S]*?\{%\s*endcontent-ref\s*%\}/g,
    (match, url) => `\n[📄 See: ${url}](${url})\n`
  );

  // Handle embed blocks: {% embed url="..." %}
  processed = processed.replace(/\{%\s*embed\s+url="([^"]+)"\s*%\}/g,
    (match, url) => `\n[🔗 ${url}](${url})\n`
  );

  // Remove any remaining {% ... %} tags that we haven't handled
  processed = processed.replace(/\{%[\s\S]*?%\}/g, '');

  return processed;
}

/**
 * Extract tab sections from preprocessed markdown for custom rendering
 */
export function extractTabSections(markdown: string): { tabs: TabSection[]; restContent: string } | null {
  const tabs: TabSection[] = [];
  let restContent = markdown;

  // Look for consecutive ### headings that came from tabs
  const tabSectionPattern = /^### (.+)$/gm;
  const matches = Array.from(markdown.matchAll(tabSectionPattern));

  if (matches.length > 1) {
    // We have multiple tab-like sections
    for (let i = 0; i < matches.length; i++) {
      const title = matches[i][1];
      const startIndex = matches[i].index! + matches[i][0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : markdown.length;

      const content = markdown.substring(startIndex, endIndex).trim();
      tabs.push({ title, content });
    }

    // Get content before first tab
    const firstTabIndex = matches[0].index!;
    restContent = markdown.substring(0, firstTabIndex);

    return { tabs, restContent };
  }

  return null;
}

/**
 * Clean up markdown content
 */
export function cleanMarkdown(markdown: string): string {
  let cleaned = markdown;

  // Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Trim
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Full preprocessing pipeline
 */
export function preprocessMarkdown(markdown: string): string {
  let processed = markdown;

  // Handle GitBook syntax
  processed = preprocessGitBookSyntax(processed);

  // Clean up
  processed = cleanMarkdown(processed);

  return processed;
}
