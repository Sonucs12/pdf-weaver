import { ExtractSidebar } from './components/extract-sidebar';
import { generateMetadata } from "@/lib/metadata";
import { StructuredData } from '@/components/StructuredData';
export const {metadata,schema} = generateMetadata({
title: "Extract Text",
description: "Extract text from PDF documents",
path: "/extract-text",
keywords:["handwritten pdf to text", "pdf to text", "pdf to markdown", "pdf to text converter", "pdf to text converter online", "pdf to text converter free", "pdf to text converter for mac", "pdf to text converter for windows", "pdf to text converter for linux", "pdf to text converter for android", "pdf to text converter for ios"],
faq: [
  { question: "What is Extract Text?", answer: "Extract Text is a tool that allows you to extract text from PDF documents." },
],
breadcrumbs: [
  { name: "Home", url: "/" },
  { name: "Extract Text", url: "/extract-text" },
],

})
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <div className="flex md:flex-row flex-col-reverse w-full overflow-hidden ">
      <ExtractSidebar />
      <main className="flex-1 overflow-auto md:h-[calc(100vh-4.2rem)] pb-14 md:pb-0">
        {children}
      </main>
    </div>
    <StructuredData data={schema} />
    </>
  );
  
}
