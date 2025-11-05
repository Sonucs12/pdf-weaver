"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  CodeSquare,
  Minus,
  WrapText,
  RemoveFormatting,
  Link as LinkIcon,
  Unlink,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCallback } from "react";

type Props = {
  editor: Editor;
};

export function TiptapEditorToolbar({ editor }: Props) {
  const handleAddLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleRemoveLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleAddImage = useCallback(() => {
    const url = window.prompt("Enter image URL");
    if (!url) return;
  
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);
  

  const formattingButtons = [
    {
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      icon: Bold,
      tooltip: "Bold (Ctrl+B)",
      disabled: !editor.can().chain().focus().toggleBold().run(),
    },
    {
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      icon: Italic,
      tooltip: "Italic (Ctrl+I)",
      disabled: !editor.can().chain().focus().toggleItalic().run(),
    },
    {
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
      icon: Strikethrough,
      tooltip: "Strikethrough",
      disabled: !editor.can().chain().focus().toggleStrike().run(),
    },
    {
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
      icon: Code,
      tooltip: "Inline Code",
      disabled: !editor.can().chain().focus().toggleCode().run(),
    },
  ];

  const headingButtons = [
    {
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
      icon: Heading1,
      tooltip: "Heading 1",
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      icon: Heading2,
      tooltip: "Heading 2",
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
      icon: Heading3,
      tooltip: "Heading 3",
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
      isActive: editor.isActive("heading", { level: 4 }),
      icon: Heading4,
      tooltip: "Heading 4",
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
      isActive: editor.isActive("heading", { level: 5 }),
      icon: Heading5,
      tooltip: "Heading 5",
    },
    {
      action: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
      isActive: editor.isActive("heading", { level: 6 }),
      icon: Heading6,
      tooltip: "Heading 6",
    },
  ];

  const blockButtons = [
    {
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: editor.isActive("paragraph"),
      icon: WrapText,
      tooltip: "Paragraph",
    },
    {
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
      icon: CodeSquare,
      tooltip: "Code Block",
    },
    {
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
      icon: Quote,
      tooltip: "Blockquote",
    },
  ];

  const listButtons = [
    {
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      icon: List,
      tooltip: "Bullet List",
    },
    {
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      icon: ListOrdered,
      tooltip: "Ordered List",
    },
  ];

  const linkButtons = [
    {
      action: handleAddLink,
      isActive: editor.isActive("link"),
      icon: LinkIcon,
      tooltip: "Add Link",
      disabled: false,
    },
    {
      action: handleRemoveLink,
      isActive: false,
      icon: Unlink,
      tooltip: "Remove Link",
      disabled: !editor.isActive("link"),
    },
  ];

  const mediaButtons = [
    {
      action: handleAddImage,
      isActive: false,
      icon: Image,
      tooltip: "Insert Image",
      disabled: false,
    },
  ];

  const utilityButtons = [
    {
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
      icon: Minus,
      tooltip: "Horizontal Rule",
    },
    {
      action: () => editor.chain().focus().unsetAllMarks().run(),
      isActive: false,
      icon: RemoveFormatting,
      tooltip: "Clear Formatting",
    },
  ];

  const historyButtons = [
    {
      action: () => editor.chain().focus().undo().run(),
      icon: Undo,
      tooltip: "Undo (Ctrl+Z)",
      disabled: !editor.can().chain().focus().undo().run(),
    },
    {
      action: () => editor.chain().focus().redo().run(),
      icon: Redo,
      tooltip: "Redo (Ctrl+Shift+Z)",
      disabled: !editor.can().chain().focus().redo().run(),
    },
  ];

  const renderButtons = (buttons: any[]) =>
    buttons.map((btn, index) => (
      <Button
        key={index}
        variant={btn.isActive ? "default" : "outline"}
        size="icon"
        onClick={btn.action}
        disabled={btn.disabled}
        aria-label={btn.tooltip}
        title={btn.tooltip}
        className="h-8 w-8"
      >
        <btn.icon className="h-4 w-4" />
      </Button>
    ));

  return (
    <div className="flex flex-wrap items-center gap-2 p-2">
      <div className="flex gap-1">{renderButtons(historyButtons)}</div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex gap-1">{renderButtons(formattingButtons)}</div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex gap-1">{renderButtons(headingButtons)}</div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex gap-1">{renderButtons(blockButtons)}</div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex gap-1">{renderButtons(listButtons)}</div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex gap-1">{renderButtons(linkButtons)}</div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex gap-1">{renderButtons(mediaButtons)}</div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex gap-1">{renderButtons(utilityButtons)}</div>
    </div>
  );
}