
"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { TiptapEditorToolbar } from "./TiptapEditorToolbar";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Preview } from "./Preview";

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

export function Editor() {
  const [markdown, setMarkdown] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        heading: { levels: [1, 2, 3,4,5,6] },
      }),
      Markdown,
    ],
    content: defaultContent,
    onUpdate({ editor }) {
      setMarkdown(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none'
      }
    },
    immediatelyRender:false,
  });

  useEffect(() => {
    if (editor && !markdown) {
      setMarkdown(editor.storage.markdown.getMarkdown());
    }
  }, [editor, markdown]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-col">
        {editor && (
          <>
            <CardHeader className="p-2 border-b">
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
