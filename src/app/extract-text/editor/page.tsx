import { Suspense } from "react";
import ClientEditorPage from "./ClientPage";
import { generateMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";

export const {metadata,schema} = generateMetadata({
  title: "Editor",
  description: "Editor",
  path: "/editor",
  keywords:["editor", "editor online", "editor for free", "editor for mac", "editor for windows", "editor for linux", "editor for android", "editor for ios"],
  faq: [
    { question: "What is Editor?", answer: "Editor is a tool that allows you to edit your documents." },
  ],
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Editor", url: "/editor" },
  ],
})

export default function EditorPage() {
  return (
    <>
    <Suspense fallback={<div className="flex flex-col min-h-screen items-center justify-center">Loading editor...</div>}>
      <ClientEditorPage />
    </Suspense>
    <StructuredData data={schema} />
    </>
  );
}
