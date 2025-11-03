"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { TiptapEditorToolbar } from "@/app/extract-text/editor/components/TiptapEditorToolbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { markdownToHtml } from "@/hooks/use-markdown-to-html";

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
    <div className="space-y-4">
      <Card className="flex flex-col">
        {editor && (
          <CardHeader className="sticky top-0  z-50 p-3 border-b bg-card">
            <TiptapEditorToolbar editor={editor} />
          </CardHeader>
        )}
        <CardContent className=" p-4 flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </CardContent>
      </Card>
    </div>
  );
}


