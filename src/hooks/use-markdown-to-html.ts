'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';

export function markdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) {
    return '';
  }
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  });
  return md.render(markdown);
}
export function useMarkdownToHtml(markdown: string): string {
  const html = useMemo(() => markdownToHtml(markdown), [markdown]);
  return html;
}

