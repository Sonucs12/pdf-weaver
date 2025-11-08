"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Editor } from "./components/Editor";
import ScrollContainer from "@/components/ui/ScrollContainer";

export default function ClientEditorPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [draftsStorage] = useLocalStorage<Record<string, any>>("pdf-write-drafts", {});
  const [savedItemsStorage] = useLocalStorage<Record<string, any>>("saved-extracts", {});
  const [initialContent, setInitialContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const isEditMode = !!id;

  useEffect(() => {
    if (id) {
      // Try to find in drafts first, then saved items - direct object access
      const draft = draftsStorage[id];
      const savedItem = savedItemsStorage[id] || Object.values(savedItemsStorage).find((item: any) => item.title === id);
      
      const itemToEdit = draft || savedItem;

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
  }, [id, draftsStorage, savedItemsStorage]);

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
