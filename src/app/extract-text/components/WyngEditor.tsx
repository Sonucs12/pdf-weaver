"use client";

import { BaseTiptapEditor } from "./BaseTiptapEditor";

interface WyngEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

export function WyngEditor({ markdown, onChange, placeholder, className }: WyngEditorProps) {
  return (
    <BaseTiptapEditor
      markdown={markdown}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}


