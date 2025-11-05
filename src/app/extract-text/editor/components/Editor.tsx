"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { TiptapEditorToolbar } from "./TiptapEditorToolbar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { SaveButton } from '@/app/extract-text/create-new/components/SaveButton';
import { ExportMenu } from '@/app/extract-text/create-new/components/ExportMenu';
import { MarkdownPreviewDialog } from '@/app/extract-text/components/MarkdownPreviewDialog';
import { markdownToHtml } from '@/hooks/use-markdown-to-html';

const defaultContent = `
<h2>
  Welcome to TypeSync Editor
</h2>
<p>
  This is a WYSIWYG editor built with <strong>Tiptap</strong>, <strong>Next.js</strong>, and <strong>ShadCN UI</strong>. You can write your content here and see live previews in Markdown and HTML on the right.
</p>
<ul>
  <li>Real-time WYSIWYG editing</li>
  <li>Markdown and HTML previews</li>
  <li>Light and Dark mode support</li>
  <li>Minimalist, distraction-free interface</li>
</ul>
<p>
  Use the toolbar above to format your text. Try things like <strong>bold</strong>, <em>italics</em>, <code>code</code>, and more.
</p>
`;

export function Editor({ initialContent = '', fileName: propFileName = 'untitled', isEditMode = false, id }: { initialContent?: string; fileName?: string; isEditMode?: boolean; id?: string }) {
  const [markdown, setMarkdown] = useState(isEditMode ? (initialContent || '') : '');
  const [editedText, setEditedText] = useState(isEditMode ? markdownToHtml(initialContent || '') : '');
  const [fileName, setFileName] = useState(propFileName);
  const baselineMarkdownRef = useRef<string>(isEditMode ? (initialContent || '') : '');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        heading: { levels: [1, 2, 3,4,5,6] },
      }),
      Markdown,
    ],
    content: isEditMode ? (initialContent || '') : defaultContent,
    onUpdate({ editor }) {
      const currentMarkdown = editor.storage.markdown.getMarkdown();
      setMarkdown(currentMarkdown);
      setEditedText(markdownToHtml(currentMarkdown));
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none'
      }
    },
    immediatelyRender:false,
  });

  useEffect(() => {
    if (!editor) return;
    if (isEditMode) {
      editor.commands.setContent(initialContent || '');
      setMarkdown(initialContent || '');
      setEditedText(markdownToHtml(initialContent || ''));
      baselineMarkdownRef.current = initialContent || '';
      if (propFileName && propFileName !== fileName) setFileName(propFileName);
      return;
    }
    if (!markdown) {
      editor.commands.setContent(defaultContent);
      const initialMarkdown = editor.storage.markdown.getMarkdown();
      setMarkdown(initialMarkdown);
      setEditedText(markdownToHtml(initialMarkdown));
    }
    if (propFileName && propFileName !== fileName) setFileName(propFileName);
  }, [editor, isEditMode, initialContent, propFileName]);

  const hasChanged = isEditMode ? ((markdown || '').trim() !== (baselineMarkdownRef.current || '').trim()) : false;

  return (
    <div className="space-y-4"> <div className="flex justify-end items-center gap-2">
                <MarkdownPreviewDialog markdown={markdown} title="Preview Content" triggerLabel="Preview" size="lg" />
                <SaveButton fileName={fileName} editedText={editedText} editedMarkdown={markdown} onSave={() => {}} isEditMode={isEditMode} isDisabled={isEditMode ? !hasChanged : false} />
                <ExportMenu editedText={editedText} editedMarkdown={markdown} fileName={fileName} isProcessing={false} />
              </div>
      <Card className="flex flex-col">
        {editor && (
          <>
            <CardHeader className="p-2 border-b flex flex-row items-center justify-between">
              <TiptapEditorToolbar editor={editor} />
             
            </CardHeader>
          </>
        )}
        <CardContent className="p-4 flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </CardContent>
      </Card>
    </div>
  );
}
