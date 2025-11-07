"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Editor } from "./components/Editor";
import ScrollContainer from "@/components/ui/ScrollContainer";

export default function ClientEditorPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [drafts] = useLocalStorage<any[]>("pdf-write-drafts", []);
  const [savedItems] = useLocalStorage<any[]>("saved-extracts", []);
  const [initialContent, setInitialContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const isEditMode = !!id;

  useEffect(() => {
    if (id) {
      const itemToEdit =
        drafts.find((d) => d.id === id) ||
        savedItems.find((i) => i.title === id);

      if (itemToEdit) {
        setInitialContent(
          itemToEdit.editedMarkdown || itemToEdit.editedText || ""
        );
        setFileName(itemToEdit.fileName || "untitled");
      } else {
        console.error("Item not found for ID:", id);
      }
    }
    setIsLoading(false);
  }, [id, drafts, savedItems]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        Loading editor...
      </div>
    );
  }

  return (
    <ScrollContainer scrollType="window">
      <main className="flex-1 mx-auto py-4 sm:py-6 md:py-8">
        <Editor
          id={id || undefined}
          initialContent={initialContent}
          fileName={fileName}
          isEditMode={isEditMode}
        />
      </main>
    </ScrollContainer>
  );
}
