"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { TiptapEditorToolbar } from "@/app/extract-text/editor/components/TiptapEditorToolbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { markdownToHtml } from "@/hooks/use-markdown-to-html";
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface WyngEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

export function WyngEditor({ markdown, onChange, placeholder, className }: WyngEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Markdown,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded-md max-w-full mx-auto",
        },
      }),
    ],
    content: markdownToHtml(markdown || ""),
    onUpdate({ editor }) {
      onChange(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none focus:outline-none ${className || ""}`,
        "data-placeholder": placeholder || "Write or edit your content...",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const currentMarkdown = editor.storage.markdown.getMarkdown();
    if (markdown === currentMarkdown) return;
    const html = markdownToHtml(markdown || "");
    editor.commands.setContent(html, { emitUpdate: false });
  }, [editor, markdown]);

  return (
    <div className="flex flex-col border-none ">
    {editor && (
      <div className=" sticky top-0 z-10 bg-background py-2  border-b flex flex-row items-center justify-between">
        <TiptapEditorToolbar editor={editor} />
      </div>
    )}
    <div className="py-4 flex-1 overflow-y-auto">
      <EditorContent editor={editor} />
    </div>
  </div>
  );
}


