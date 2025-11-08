import { generateMetadata } from "@/lib/metadata";
import { Faq } from "@/components/ui/faq";

const { metadata } = generateMetadata({
  title: "What is PDFWriter?",
  description: "A detailed explanation of PDFWriter's features, security, and how to use it.",
  path: "/what-is-this",
});
export { metadata };

const faqItems = [
  {
    question: "What is the maximum file size for uploads?",
    answer: "The maximum file size is 100MB.",
  },
  {
    question: "How many pages can I process at once?",
    answer: "You can process up to 50 pages per upload.",
  },
  {
    question: "Is there a daily limit on page processing?",
    answer: "No, the limit is per-upload. You can start a new session to process more pages.",
  },
  {
    question: "Where is my data stored?",
    answer: "Your saved projects are stored on your device in your browser's local storage. Your uploaded files are deleted from our servers after processing.",
  },
];

export default function WhatIsThisPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">What is PDFWriter?</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Your smart assistant for transforming static PDFs—including scanned documents and handwritten notes—into editable, high-quality content.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Your Security and Privacy</h2>
          <p className="text-muted-foreground text-center mb-8">
            We take your security and privacy seriously. Here's how we protect your data:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Uploaded Files</h3>
              <p className="text-muted-foreground">
                Your uploaded PDF files are processed securely and are deleted from our servers immediately after processing. We do not store your files.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Saved Projects</h3>
              <p className="text-muted-foreground">
                Your saved projects, including the text content and any edits you make, are stored directly in your browser's local storage. This means your data is stored on your own device and is not sent to our servers. Only you have access to your saved projects.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Content Sanitization</h3>
              <p className="text-muted-foreground">
                All content is sanitized to prevent malicious scripts from running, ensuring a safe editing experience.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works: A Detailed Walkthrough</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-2">1. Upload Your PDF</h3>
              <p className="text-muted-foreground">
                You can upload a PDF file up to 100MB in size.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">2. Select Your Pages</h3>
              <p className="text-muted-foreground">
                You can select up to 50 pages from your PDF to process at one time. This limit is per-upload, not a daily limit. You can upload another file and process another 50 pages.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">3. The AI-Powered Transformation</h3>
              <p className="text-muted-foreground">
                Our AI analyzes the structure of your document, identifies headings, paragraphs, lists, and other elements, and then formats them into a clean, editable document.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">4. The Editor: Your Creative Space</h3>
              <p className="text-muted-foreground">
                Our WYSIWYG editor allows you to refine the AI's output. You can edit text, add new content, and use the toolbar to format headings, lists, and more.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">5. Saving Your Progress: Drafts vs. Saved Projects</h3>
              <div className="ml-4">
                <h4 className="text-xl font-semibold mt-4 mb-2">Automatic Drafts</h4>
                <p className="text-muted-foreground">
                  As you type in the editor, your work is automatically saved as a draft every few seconds. This prevents you from losing your work if you accidentally close the tab. You can find your latest draft on the "Drafts" page.
                </p>
                <h4 className="text-xl font-semibold mt-4 mb-2">Manual Saves</h4>
                <p className="text-muted-foreground">
                  When you are satisfied with your document, you can manually save it. This will store the project in your browser's local storage, and you can access it from the "Saved" page. From there, you can open, update, or delete your saved projects.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">6. Exporting Your Final Document</h3>
              <p className="text-muted-foreground">
                You can export your finished document as an HTML file, a PDF, or a Microsoft Word document (DOCX).
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Understanding the Application's Pages</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-2">Extract Text</h3>
              <p className="text-muted-foreground">
                This is the main page where you'll do most of your work.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Drafts</h3>
              <p className="text-muted-foreground">
                This page holds your most recent auto-saved work.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Saved</h3>
              <p className="text-muted-foreground">
                This is your personal library of projects that you have manually saved.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions (FAQ)</h2>
          <Faq items={faqItems} />
        </section>
      </div>
    </div>
  );
}