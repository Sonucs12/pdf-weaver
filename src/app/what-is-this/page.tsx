
import { generateMetadata } from "@/lib/metadata";

const { metadata } = generateMetadata({
  title: "What is PDFWrite?",
  description: "An explanation of what PDFWrite is and what it does.",
  path: "/what-is-this",
});
export { metadata };

export default function WhatIsThisPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">What is PDFWrite?</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          PDFWrite is a tool to help you convert PDF documents into editable Markdown.
        </p>
      </div>

      <div className="max-w-4xl mx-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-4">The Problem</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            PDFs are great for sharing documents, but they are difficult to edit. If you want to extract text from a PDF, you often have to copy and paste it, which can lead to formatting issues.
          </p>
          <h2>The Solution</h2>
          <p>
            PDFWrite solves this problem by providing a simple interface to upload a PDF and convert it into Markdown. You can then edit the Markdown in a WYSIWYG editor and export it to various formats.
          </p>
        </div>
      </div>
    </div>
  );
}
