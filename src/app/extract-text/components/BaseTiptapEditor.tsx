"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import { markdownToHtml } from "@/hooks/use-markdown-to-html";
import { TiptapEditorToolbar } from "./TiptapEditorToolbar";


interface BaseTiptapEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  className?: string;
  placeholder?: string;
  onEditorReady?: (editor: Editor) => void;
}

export function BaseTiptapEditor({
  markdown,
  onChange,
  className,
  placeholder,
  onEditorReady,
}: BaseTiptapEditorProps) {


  const baseExtensions = [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false,
      link: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-blue-500 underline" },
    }),
    Markdown,
    CodeBlock.configure({
      HTMLAttributes: {
        class:
          "not-prose whitespace-pre tab-[4] block w-full overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm",
      },
    }),
    Image.configure({
      inline: false,
      HTMLAttributes: { class: "rounded-md max-w-full mx-auto" },
    }),
  ];
  const extensions = baseExtensions.filter(
    (ext, i) =>
      baseExtensions.findIndex((e) => (e as any).name === (ext as any).name) ===
      i
  );

  const editor = useEditor({
    extensions,
    content: markdownToHtml(markdown || ""),
    onUpdate({ editor }) {
      onChange(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none focus:outline-none prose-pre:whitespace-pre prose-pre:tab-size-[4] ${
          className || ""
        }`,
        "data-placeholder": placeholder || "Write or edit your content...",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    const currentMarkdown = editor.storage.markdown.getMarkdown();
    if (markdown === currentMarkdown) return;
    const html = markdownToHtml(markdown || "");
    editor.commands.setContent(html, { emitUpdate: false });
  }, [editor, markdown]);

  return (
    <div className="flex flex-col">
      {editor && (
        <div className="sticky top-[4.1rem] z-20 bg-background border-b py-2 px-4 sm:px-6 md:px-8">
          <TiptapEditorToolbar editor={editor} />
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
  
  
}
