"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Editor as TiptapEditor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/app/extract-text/create-new/components/SaveButton";
import { ExportMenu } from "@/app/extract-text/create-new/components/ExportMenu";
import { MarkdownPreviewDialog } from "@/app/extract-text/components/MarkdownPreviewDialog";
import { BaseTiptapEditor } from "@/app/extract-text/components/BaseTiptapEditor";
import { markdownToHtml } from "@/hooks/use-markdown-to-html";

const DEFAULT_MARKDOWN = `## Welcome to TypeSync Editor

This is a WYSIWYG editor built with **Tiptap**, **Next.js**, and **ShadCN UI**. You can write your content here and see live previews in Markdown and HTML on the right.

- Real-time WYSIWYG editing
- Markdown and HTML previews
- Light and Dark mode support
- Minimalist, distraction-free interface

Use the toolbar above to format your text. Try things like **bold**, _italics_, \`inline code\`, and more.`;

interface EditorProps {
  initialContent?: string;
  fileName?: string;
  isEditMode?: boolean;
  id?: string;
}

interface EditorToolbarProps {
  id?: string;
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
  id,
  isEditMode,
  forceCreateMode,
  fileName,
  markdown,
  editedText,
  hasChanged,
  onStartFromScratch,
  onSave,
}: EditorToolbarProps) => {
  const effectiveEditMode = isEditMode && !forceCreateMode;

  return (
    <div className="flex justify-between flex-wrap items-center gap-4">
      <div>
        {effectiveEditMode && (
          <span className="text-sm font-medium text-foreground px-4 sm:px-6 md:px-8">
            {fileName}
          </span>
        )}
      </div>

      <div className="flex items-center px-4 sm:px-6 md:px-8 gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {effectiveEditMode && (
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
          id={id}
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
  initialContent = "",
  fileName: propFileName = "untitled",
  isEditMode = false,
  id,
}: EditorProps) {
  const router = useRouter();
  const baselineMarkdownRef = useRef<string>(isEditMode ? initialContent || "" : "");

  const [forceCreateMode, setForceCreateMode] = useState(false);
  const [fileName, setFileName] = useState(propFileName);
  const [markdown, setMarkdown] = useState(
    isEditMode ? initialContent || DEFAULT_MARKDOWN : DEFAULT_MARKDOWN
  );
  const [editedText, setEditedText] = useState(
    markdownToHtml(isEditMode ? initialContent || DEFAULT_MARKDOWN : DEFAULT_MARKDOWN)
  );

  const effectiveEditMode = useMemo(
    () => isEditMode && !forceCreateMode,
    [isEditMode, forceCreateMode]
  );

  const hasChanged = useMemo(
    () => effectiveEditMode && (markdown || "").trim() !== (baselineMarkdownRef.current || "").trim(),
    [effectiveEditMode, markdown]
  );

  const handleEditorUpdate = useCallback((currentMarkdown: string) => {
    setMarkdown(currentMarkdown);
    setEditedText(markdownToHtml(currentMarkdown));
  }, []);

  const handleStartFromScratch = useCallback(() => {
    setForceCreateMode(true);
    setMarkdown(DEFAULT_MARKDOWN);
    setEditedText(markdownToHtml(DEFAULT_MARKDOWN));
    setFileName("untitled");
    baselineMarkdownRef.current = "";
    router.replace("/extract-text/editor");
  }, [router]);

  const handleSave = useCallback(() => {}, []);

  useEffect(() => {
    if (propFileName && propFileName !== fileName) {
      setFileName(propFileName);
    }

    if (effectiveEditMode && baselineMarkdownRef.current !== (initialContent || "")) {
      const initial = initialContent || "";
      baselineMarkdownRef.current = initial;
      setMarkdown(initial);
      setEditedText(markdownToHtml(initial));
    }
  }, [effectiveEditMode, initialContent, propFileName, fileName]);

  return (
    <div className="space-y-4">
      <EditorToolbar
        id={id}
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
        onEditorReady={() => {}}
        placeholder={DEFAULT_MARKDOWN}
      />
    </div>
  );
}