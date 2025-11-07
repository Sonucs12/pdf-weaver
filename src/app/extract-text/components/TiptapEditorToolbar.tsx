"use client";

import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";
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
import { useCallback, useEffect, useState, memo } from "react";

interface ToolbarButton {
  action: () => void;
  isActive: boolean;
  icon: LucideIcon;
  tooltip: string;
  disabled: boolean;
}

interface TiptapEditorToolbarProps {
  editor: Editor | null;
}

// Memoized button group component to prevent unnecessary re-renders
const ButtonGroup = memo(({ buttons }: { buttons: ToolbarButton[] }) => (
  <div className="flex gap-1">
    {buttons.map((btn, index) => (
      <Button
        key={index}
        variant={btn.isActive ? "default" : "outline"}
        size="icon"
        onClick={btn.action}
        disabled={btn.disabled}
        aria-label={btn.tooltip}
        title={btn.tooltip}
        className="h-9 w-9"
      >
        <btn.icon className="h-4 w-4" />
      </Button>
    ))}
  </div>
));

ButtonGroup.displayName = "ButtonGroup";

export const TiptapEditorToolbar = memo(
  ({ editor }: TiptapEditorToolbarProps) => {
    const [, forceRerender] = useState(0);
    const handleUpdate = useCallback(() => {
      forceRerender((v) => v + 1);
    }, []);

    useEffect(() => {
      if (!editor) return;

      editor.on("selectionUpdate", handleUpdate);
      editor.on("transaction", handleUpdate);
      editor.on("update", handleUpdate);

      return () => {
        editor.off("selectionUpdate", handleUpdate);
        editor.off("transaction", handleUpdate);
        editor.off("update", handleUpdate);
      };
    }, [editor, handleUpdate]);

    const handleAddLink = useCallback(() => {
      if (!editor) return;

      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("Enter URL:", previousUrl);

      if (url === null) return;

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }, [editor]);

    const handleRemoveLink = useCallback(() => {
      if (!editor) return;
      editor.chain().focus().unsetLink().run();
    }, [editor]);

    const handleAddImage = useCallback(() => {
      if (!editor) return;

      const url = window.prompt("Enter image URL");
      if (!url) return;

      editor.chain().focus().setImage({ src: url }).run();
    }, [editor]);

    const handleClearFormatting = useCallback(() => {
      if (!editor) return;

      const chain = editor.chain().focus();

      if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
        chain.liftListItem("listItem").run();
        return;
      }

      if (
        editor.isActive("heading") ||
        editor.isActive("codeBlock") ||
        editor.isActive("blockquote")
      ) {
        chain.clearNodes().setParagraph().run();
        return;
      }

      chain.unsetAllMarks().run();
    }, [editor]);
    if (!editor) {
      return null;
    }

    const formattingButtons: ToolbarButton[] = [
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

    const headingButtons: ToolbarButton[] = [
      {
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive("heading", { level: 1 }),
        icon: Heading1,
        tooltip: "Heading 1",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
        icon: Heading2,
        tooltip: "Heading 2",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive("heading", { level: 3 }),
        icon: Heading3,
        tooltip: "Heading 3",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
        isActive: editor.isActive("heading", { level: 4 }),
        icon: Heading4,
        tooltip: "Heading 4",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
        isActive: editor.isActive("heading", { level: 5 }),
        icon: Heading5,
        tooltip: "Heading 5",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
        isActive: editor.isActive("heading", { level: 6 }),
        icon: Heading6,
        tooltip: "Heading 6",
        disabled: false,
      },
    ];

    const blockButtons: ToolbarButton[] = [
      {
        action: () => editor.chain().focus().setParagraph().run(),
        isActive: editor.isActive("paragraph"),
        icon: WrapText,
        tooltip: "Paragraph",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: editor.isActive("codeBlock"),
        icon: CodeSquare,
        tooltip: "Code Block",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: editor.isActive("blockquote"),
        icon: Quote,
        tooltip: "Blockquote",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
        icon: List,
        tooltip: "Bullet List",
        disabled: false,
      },
      {
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
        icon: ListOrdered,
        tooltip: "Ordered List",
        disabled: false,
      },
    ];
    const linkButtons: ToolbarButton[] = [
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
      {
        action: handleAddImage,
        isActive: false,
        icon: Image,
        tooltip: "Insert Image",
        disabled: false,
      },
    ];
    const utilityButtons: ToolbarButton[] = [
      {
        action: () => editor.chain().focus().setHorizontalRule().run(),
        isActive: false,
        icon: Minus,
        tooltip: "Horizontal Rule",
        disabled: false,
      },
      
    ];

    const historyButtons: ToolbarButton[] = [
      {
        action: () => editor.chain().focus().undo().run(),
        isActive: false,
        icon: Undo,
        tooltip: "Undo (Ctrl+Z)",
        disabled: !editor.can().chain().focus().undo().run(),
      },
      {
        action: () => editor.chain().focus().redo().run(),
        isActive: false,
        icon: Redo,
        tooltip: "Redo (Ctrl+Shift+Z)",
        disabled: !editor.can().chain().focus().redo().run(),
      },
      {
        action: handleClearFormatting,
        isActive: false,
        icon: RemoveFormatting,
        tooltip: "Clear Formatting",
        disabled: (() => {
          const canInline = editor.can().chain().focus().unsetAllMarks().run();
          const canList =
            editor.isActive("bulletList") || editor.isActive("orderedList");
          const canBlock =
            editor.isActive("heading") ||
            editor.isActive("codeBlock") ||
            editor.isActive("blockquote");
          return !(canInline || canList || canBlock);
        })(),
      },
    ];

    return (
      <div className="flex flex-wrap items-center gap-2 py-2">
         <div className="flex whitespace-normal overflow-x-auto scrollbar-hide gap-2 px-4 md:px-0 sm:px-0">
        <ButtonGroup buttons={historyButtons} />
        <Separator orientation="vertical" className="h-8" />
        <ButtonGroup buttons={headingButtons} />
        </div>
        <Separator orientation="vertical" className="h-8 hidden lg:block" />
        <div className="flex whitespace-normal overflow-x-auto scrollbar-hide gap-2 px-4 md:px-0 sm:px-0">
        <ButtonGroup buttons={formattingButtons} />
        <Separator orientation="vertical" className="h-8" />
        <ButtonGroup buttons={blockButtons} />
        </div>
        <Separator orientation="vertical" className="h-8 hidden lg:block" />
        <div className="flex whitespace-normal overflow-x-auto scrollbar-hide gap-2 px-4 md:px-0 sm:px-0">
        <ButtonGroup buttons={linkButtons} />
        <Separator orientation="vertical" className="h-8" />
        <ButtonGroup buttons={utilityButtons} />
        </div>
      </div>
    );
  }
);

TiptapEditorToolbar.displayName = "TiptapEditorToolbar";
