import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Zap, Eye } from "lucide-react";
import { generateMetadata } from "@/lib/metadata";
import { StructuredData } from "@/components/StructuredData";
import { MAX_FILE_SIZE_MB, MAX_PAGES_ALLOWED, MAX_PDF_GENERATIONS } from "@/lib/security";
export const { metadata, schema } = generateMetadata({
  title: "Extract Text",
  description: "Extract text from PDF documents, markdown, images ,scanned documents and handwritten notes",
  path: "/extract-text",
  keywords: [
    "handwritten pdf to text",
    "pdf to text",
    "pdf to markdown",
    "pdf to text converter",
    "pdf to text converter online",
    "pdf to text converter free",
    "pdf to text converter for mac",
    "pdf to text converter for windows",
    "pdf to text converter for linux",
    "pdf to text converter for android",
    "pdf to text converter for ios",
    "handwritten pdf to text",
  ],
  faq: [
    {
      question: "What is the maximum file size for uploads?",
      answer: `The maximum file size is ${MAX_FILE_SIZE_MB}MB per file.`,
    },
    {
      question: "What is PDFWriter?",
      answer:
        "PDFWriter is a tool that allows you to extract text from PDF documents, markdown, images ,scanned documents and handwritten notes.",
    },
    {
      question: "How many pages can I process at once?",
      answer: `You can process up to ${MAX_PAGES_ALLOWED} pages per upload. For example, you can select pages 1-${MAX_PAGES_ALLOWED}, or any range up to ${MAX_PAGES_ALLOWED} pages like 3-7 or just a single page like 5.`,
    },
    {
      question: "Is there a limit on how many times I can generate content?",
      answer: `Yes, you can generate content up to ${MAX_PDF_GENERATIONS} times. This limit helps ensure fair usage for all users.`,
    },
    {
      question: "Where is my data stored?",
      answer: "Your saved projects are stored on your device in your browser's local storage. Your uploaded files are deleted from our servers immediately after processing.",
    },
    {
      question: "Can I upload image files instead of PDFs?",
      answer: "Yes! You can upload multiple image files (JPG, PNG, etc.) at once. The app will process all images you select.",
    },
    {
      question: "What happens if I close the browser while editing?",
      answer: "If you close the browser without clicking the 'Back' button, your work will not be saved as a draft. To ensure your work is saved, either click 'Back' to create a draft, or use the 'Save' button to create a permanent saved project before closing.",
    },
    {
      question: "How does merging into an existing project work?",
      answer: "When you click 'Save', you can choose to merge your current content into an existing project. Your current content will be appended to the end of the selected project, separated by a blank line. This is perfect for combining multiple document extractions into one master document.",
    },
  ],
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Extract Text", url: "/extract-text" },
  ],
});
export default function ExtractTextLandingPage() {
  return (
    <>
      <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-2xl w-full mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Extract Text from PDFs with Ease
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Our powerful tool allows you to upload a PDF and extract the text
              content, which you can then edit, format, and export.
            </p>
          </div>

          <Link href="/extract-text/create-new" passHref>
            <Button size="lg">
              <Zap className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </Link>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <FileText className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-medium">Upload PDF</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Easily upload your PDF files.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-medium">Extract Text</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Quickly extract all the text content.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Eye className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-medium">Edit & Export</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Edit, format, and export your text.
              </p>
            </div>
          </div>
        </div>
      </div>
      <StructuredData data={schema} />
    </>
  );
}
