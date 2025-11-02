'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';

/**
 * Hook to convert markdown content to HTML using markdown-it
 * @param markdown - The markdown content to convert
 * @returns HTML string
 */
export function useMarkdownToHtml(markdown: string): string {
  const html = useMemo(() => {
    if (!markdown || !markdown.trim()) {
      return '';
    }

    // Initialize markdown-it with options
    const md = new MarkdownIt({
      html: true,        // Enable HTML tags in source
      breaks: true,      // Convert '\n' in paragraphs into <br>
      linkify: true,     // Autoconvert URL-like text to links
      typographer: true, // Enable some language-neutral replacement + quotes beautification
    });

    // Convert markdown to HTML
    return md.render(markdown);
  }, [markdown]);

  return html;
}

