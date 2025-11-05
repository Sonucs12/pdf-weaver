"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { TiptapEditorToolbar } from "./TiptapEditorToolbar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SaveButton } from '@/app/extract-text/create-new/components/SaveButton';
import { ExportMenu } from '@/app/extract-text/create-new/components/ExportMenu';
import { MarkdownPreviewDialog } from '@/app/extract-text/components/MarkdownPreviewDialog';
import { markdownToHtml } from '@/hooks/use-markdown-to-html';
import { useRouter } from "next/navigation";
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
const DEFAULT_CONTENT = `
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

const EDITOR_EXTENSIONS = [
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
    HTMLAttributes: {
      class: 'max-w-full h-auto',
    },
  }),
];
const EDITOR_PROPS = {
  attributes: {
    class: 'prose dark:prose-invert max-w-none focus:outline-none'
  }
};

interface EditorProps {
  initialContent?: string;
  fileName?: string;
  isEditMode?: boolean;
  id?: string;
}

interface EditorToolbarProps {
  isEditMode: boolean;
  forceCreateMode: boolean;
  fileName: string;
  markdown: string;
  editedText: string;
  hasChanged: boolean;
  onStartFromScratch: () => void;
  onSave: () => void;
}

const EditorToolbar = ({ 
  isEditMode, 
  forceCreateMode, 
  fileName, 
  markdown, 
  editedText, 
  hasChanged,
  onStartFromScratch,
  onSave 
}: EditorToolbarProps) => {
  const effectiveEditMode = isEditMode && !forceCreateMode;

  return (
    <div className="flex justify-between items-center gap-2">
      <div>
        {effectiveEditMode && (
          <span className="text-sm font-medium text-foreground">
            {fileName}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {isEditMode && !forceCreateMode && (
          <Button variant="outline" onClick={onStartFromScratch}>
            Start from scratch
          </Button>
        )}
        <MarkdownPreviewDialog 
          markdown={markdown} 
          title="Preview Content" 
          triggerLabel="Preview" 
          size="lg" 
        />
        <SaveButton 
          fileName={fileName} 
          editedText={editedText} 
          editedMarkdown={markdown} 
          onSave={onSave} 
          isEditMode={effectiveEditMode} 
          isDisabled={effectiveEditMode ? !hasChanged : false}
        />
        <ExportMenu 
          editedText={editedText} 
          editedMarkdown={markdown} 
          fileName={fileName} 
          isProcessing={false} 
        />
      </div>
    </div>
  );
};

export function Editor({ 
  initialContent = '', 
  fileName: propFileName = 'untitled', 
  isEditMode = false, 
  id 
}: EditorProps) {
  const router = useRouter();
  const [markdown, setMarkdown] = useState(isEditMode ? (initialContent || '') : '');
  const [editedText, setEditedText] = useState(isEditMode ? markdownToHtml(initialContent || '') : '');
  const [fileName, setFileName] = useState(propFileName);
  const [forceCreateMode, setForceCreateMode] = useState(false);
  const baselineMarkdownRef = useRef<string>(isEditMode ? (initialContent || '') : '');

  const effectiveEditMode = useMemo(() => 
    isEditMode && !forceCreateMode, 
    [isEditMode, forceCreateMode]
  );

  const hasChanged = useMemo(() => 
    effectiveEditMode ? ((markdown || '').trim() !== (baselineMarkdownRef.current || '').trim()) : false,
    [effectiveEditMode, markdown]
  );

  const handleEditorUpdate = useCallback(({ editor }: any) => {
    const currentMarkdown = editor.storage.markdown.getMarkdown();
    setMarkdown(currentMarkdown);
    setEditedText(markdownToHtml(currentMarkdown));
  }, []);

  const handleSave = useCallback(() => {}, []);

  const handleStartFromScratch = useCallback(() => {
    setForceCreateMode(true);
    if (!editor) return;
    
    editor.commands.setContent(DEFAULT_CONTENT);
    const fresh = editor.storage.markdown.getMarkdown();
    setMarkdown(fresh);
    setEditedText(markdownToHtml(fresh));
    baselineMarkdownRef.current = '';
    setFileName('untitled');
    
    router.replace('/extract-text/editor');
  }, [router]);

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: effectiveEditMode ? (initialContent || '') : DEFAULT_CONTENT,
    onUpdate: handleEditorUpdate,
    editorProps: EDITOR_PROPS,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    
    if (effectiveEditMode) {
      editor.commands.setContent(initialContent || '');
      setMarkdown(initialContent || '');
      setEditedText(markdownToHtml(initialContent || ''));
      baselineMarkdownRef.current = initialContent || '';
      if (propFileName && propFileName !== fileName) setFileName(propFileName);
      return;
    }
    
    if (!markdown) {
      editor.commands.setContent(DEFAULT_CONTENT);
      const initialMarkdown = editor.storage.markdown.getMarkdown();
      setMarkdown(initialMarkdown);
      setEditedText(markdownToHtml(initialMarkdown));
    }
    
    if (propFileName && propFileName !== fileName) setFileName(propFileName);
  }, [editor, effectiveEditMode, initialContent, propFileName, fileName, markdown]);

  return (
    <div className="space-y-4">
      <EditorToolbar
        isEditMode={isEditMode}
        forceCreateMode={forceCreateMode}
        fileName={fileName}
        markdown={markdown}
        editedText={editedText}
        hasChanged={hasChanged}
        onStartFromScratch={handleStartFromScratch}
        onSave={handleSave}
      />
      
      <Card className="flex flex-col">
        {editor && (
          <CardHeader className="p-2 border-b flex flex-row items-center justify-between">
            <TiptapEditorToolbar editor={editor} />
          </CardHeader>
        )}
        <CardContent className="p-4 flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </CardContent>
      </Card>
    </div>
  );
}