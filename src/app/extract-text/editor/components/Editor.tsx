"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Editor as TiptapEditor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { SaveButton } from '@/app/extract-text/create-new/components/SaveButton';
import { ExportMenu } from '@/app/extract-text/create-new/components/ExportMenu';
import { MarkdownPreviewDialog } from '@/app/extract-text/components/MarkdownPreviewDialog';
import { markdownToHtml } from '@/hooks/use-markdown-to-html';
import { useRouter } from "next/navigation";
import { BaseTiptapEditor } from "@/app/extract-text/components/BaseTiptapEditor";
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

const EDITOR_PROPS = {};

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

  const handleEditorUpdate = useCallback((currentMarkdown: string) => {
    setMarkdown(currentMarkdown);
    setEditedText(markdownToHtml(currentMarkdown));
  }, []);

  const handleSave = useCallback(() => {}, []);

  const [editorRef, setEditorRef] = useState<TiptapEditor | null>(null);

  const handleStartFromScratch = useCallback(() => {
    setForceCreateMode(true);
    if (!editorRef) return;
    
    editorRef.commands.setContent(DEFAULT_CONTENT);
    const fresh = editorRef.storage.markdown.getMarkdown();
    setMarkdown(fresh);
    setEditedText(markdownToHtml(fresh));
    baselineMarkdownRef.current = '';
    setFileName('untitled');
    
    router.replace('/extract-text/editor');
  }, [router, editorRef]);

  useEffect(() => {
    if (propFileName && propFileName !== fileName) setFileName(propFileName);
    // Initialize state from initialContent when switching to edit mode
    if (effectiveEditMode && baselineMarkdownRef.current !== (initialContent || '')) {
      const initial = initialContent || '';
      baselineMarkdownRef.current = initial;
      setMarkdown(initial);
      setEditedText(markdownToHtml(initial));
    }
    // Initialize create mode content if empty
    if (!effectiveEditMode && !markdown) {
      setMarkdown('');
      setEditedText(markdownToHtml(''));
    }
  }, [effectiveEditMode, initialContent, propFileName, fileName, markdown]);

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
      
      <BaseTiptapEditor
        markdown={markdown}
        onChange={handleEditorUpdate}
        onEditorReady={setEditorRef}
      />
    </div>
  );
}