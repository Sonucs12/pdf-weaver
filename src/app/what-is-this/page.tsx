import { generateMetadata } from "@/lib/metadata";
import { Faq } from "@/components/ui/faq";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/lib/metadata";
import { MAX_FILE_SIZE_MB, MAX_PAGES_ALLOWED, MAX_PDF_GENERATIONS } from "@/lib/security";
const { metadata } = generateMetadata({
  title: "What is PDFWriter?",
  description: "A detailed explanation of PDFWriter's features, security, and how to use it.",
  path: "/what-is-this",
});
export { metadata };

const faqItems = [
  {
    question: "What is the maximum file size for uploads?",
    answer: `The maximum file size is ${MAX_FILE_SIZE_MB}MB per file.`,
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
  {
    question: "Can I edit a saved project after merging content into it?",
    answer: "Yes! You can open any saved project from the 'Saved' page, make edits, and save again to update it. The merge feature simply adds your new content to the end of the existing project.",
  },
];

export default function WhatIsThisPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center justify-center mb-12 h-80">
        <div className="flex items-center gap-3 mb-6">
          <Logo className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-headline font-bold text-foreground">{siteConfig.name}</h1>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">What is {siteConfig.name}?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Your smart assistant for transforming static PDFs—including scanned documents and handwritten notes—into editable, high-quality content.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Real Benefits: Why Use PDFWriter?</h2>
          <div className="space-y-6">
            <div className=" rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Transform Scanned Documents into Editable Text</h3>
              <p className="text-muted-foreground">
                Convert scanned PDFs, handwritten notes, and image files into fully editable text. No more retyping documents - let AI do the heavy lifting while you focus on refining the content.
              </p>
            </div>
            <div className="">
              <h3 className="text-xl font-semibold mb-2">Smart Document Structure Recognition</h3>
              <p className="text-muted-foreground">
                The AI automatically identifies and preserves document structure including headings, paragraphs, lists, and tables. Your formatted content is ready to edit immediately, saving hours of manual formatting work.
              </p>
            </div>
            <div className="">
              <h3 className="text-xl font-semibold mb-2">Combine Multiple Documents with Merge Feature</h3>
              <p className="text-muted-foreground">
                Extract text from different pages or documents and merge them into a single project. Perfect for compiling reports from multiple sources, combining chapters, or building comprehensive documents from various PDFs.
              </p>
            </div>
            <div className="">
              <h3 className="text-xl font-semibold mb-2">Professional Export Options</h3>
              <p className="text-muted-foreground">
                Export your work in multiple formats (HTML, Markdown, DOCX, PDF) to use in any application. Whether you need it for web publishing, documentation, or professional documents, we've got you covered.
              </p>
            </div>
            <div className="">
              <h3 className="text-xl font-semibold mb-2">Work Offline with Local Storage</h3>
              <p className="text-muted-foreground">
                All your saved projects are stored locally on your device. Work without constant internet connection, and rest assured that your data stays private and secure on your own device.
              </p>
            </div>
            <div className="">
              <h3 className="text-xl font-semibold mb-2">Rich Text Editing Experience</h3>
              <p className="text-muted-foreground">
                A powerful WYSIWYG editor with tables, formatting options, links, and more. Edit your extracted content just like you would in a word processor, with all the tools you need at your fingertips.
              </p>
            </div>
            <div className="">
              <h3 className="text-xl font-semibold mb-2">Perfect for Academic and Professional Use</h3>
              <p className="text-muted-foreground">
                Ideal for students digitizing notes, researchers compiling sources, professionals converting documents, content creators repurposing materials, and anyone who needs to extract and edit text from PDFs or images.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center">Your Security and Privacy</h2>
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
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works: A Complete Guide</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-3">1. Upload Your Files</h3>
              <p className="text-muted-foreground mb-3">
                You can upload either a PDF file or multiple image files (JPG, PNG, etc.). The maximum file size is 15MB per file.
              </p>
              <div className="ml-4 space-y-2">
                <p className="text-muted-foreground">
                  <strong>For PDFs:</strong> Click the upload area or drag and drop a single PDF file. The app will load your PDF and show you how many pages it contains.
                </p>
                <p className="text-muted-foreground">
                  <strong>For Images:</strong> You can select multiple image files at once. Simply click to select multiple files or drag and drop them all together. All selected images will be processed.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">2. Select Your Pages (PDF Only)</h3>
              <p className="text-muted-foreground mb-3">
                After uploading a PDF, you'll see a page selection screen. You can process up to 5 pages at a time.
              </p>
              <div className="ml-4 space-y-2">
                <p className="text-muted-foreground">
                  <strong>Single Page:</strong> Enter just the page number, like "5" to process only page 5.
                </p>
                <p className="text-muted-foreground">
                  <strong>Page Range:</strong> Enter a range like "2-7" to process pages 2, 3, 4, 5, 6, and 7. The range must not exceed 5 pages total.
                </p>
                <p className="text-muted-foreground">
                  <strong>Examples:</strong> "1-5" (pages 1 through 5), "3" (just page 3), "10-14" (pages 10 through 14).
                </p>
                <p className="text-muted-foreground">
                  <strong>Note:</strong> If you need to process more than 5 pages, you can process them in batches. After finishing one batch, upload the same PDF again and select the next set of pages.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">3. AI-Powered Text Extraction</h3>
              <p className="text-muted-foreground mb-3">
                Once you click "Process Pages" or upload images, the AI will analyze your document and extract the text content.
              </p>
              <div className="ml-4 space-y-2">
                <p className="text-muted-foreground">
                  <strong>What the AI Does:</strong> The AI analyzes the structure of your document, identifies headings, paragraphs, lists, tables, and other elements, then formats them into clean, editable markdown text.
                </p>
                <p className="text-muted-foreground">
                  <strong>Processing Time:</strong> This may take a few moments depending on the number of pages. You'll see a progress indicator showing which page is currently being processed.
                </p>
                <p className="text-muted-foreground">
                  <strong>Generation Limit:</strong> You can generate content up to 15 times. Each upload and processing counts as one generation.
                </p>
                <p className="text-muted-foreground">
                  <strong>Canceling:</strong> You can cancel the processing at any time using the "Cancel" button if needed.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">4. The Editor: Your Creative Workspace</h3>
              <p className="text-muted-foreground mb-3">
                After processing, you'll see the extracted text in a rich text editor. This is where you can edit, format, and enhance your content.
              </p>
              <div className="ml-4 space-y-3">
                <div>
                  <h4 className="text-xl font-semibold mb-2">Editor Toolbar Features</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>History Controls:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Undo</strong> (Ctrl+Z): Revert your last action</li>
                      <li><strong>Redo</strong> (Ctrl+Shift+Z): Restore an action you undid</li>
                      <li><strong>Clear Formatting</strong>: Remove all formatting from selected text</li>
                    </ul>
                    <p className="mt-2"><strong>Headings:</strong> Convert text to different heading levels (H1 through H6). H1 is the largest, H6 is the smallest.</p>
                    <p className="mt-2"><strong>Text Formatting:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Bold</strong> (Ctrl+B): Make text bold</li>
                      <li><strong>Italic</strong> (Ctrl+I): Make text italic</li>
                      <li><strong>Strikethrough</strong>: Draw a line through text</li>
                      <li><strong>Inline Code</strong>: Format text as code (monospace font)</li>
                    </ul>
                    <p className="mt-2"><strong>Block Elements:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Paragraph</strong>: Regular paragraph text</li>
                      <li><strong>Code Block</strong>: Multi-line code blocks with syntax highlighting</li>
                      <li><strong>Blockquote</strong>: Quote or highlight important text</li>
                      <li><strong>Bullet List</strong>: Create unordered lists with bullets</li>
                      <li><strong>Ordered List</strong>: Create numbered lists</li>
                      <li><strong>Horizontal Rule</strong>: Insert a divider line</li>
                    </ul>
                    <p className="mt-2"><strong>Links & Media:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Add Link</strong>: Select text and click to add a hyperlink. Enter the URL when prompted.</li>
                      <li><strong>Remove Link</strong>: Remove a link from selected text</li>
                      <li><strong>Insert Image</strong>: Add an image by entering an image URL</li>
                    </ul>
                    <p className="mt-2"><strong>Tables:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Insert Table</strong>: Create a 3x3 table with a header row</li>
                      <li><strong>Add Row After</strong>: Add a new row below the current row</li>
                      <li><strong>Delete Row</strong>: Remove the current row</li>
                      <li><strong>Add Column After</strong>: Add a new column to the right</li>
                      <li><strong>Delete Column</strong>: Remove the current column</li>
                      <li><strong>Delete Table</strong>: Remove the entire table</li>
                      <li><strong>Resize Columns</strong>: Click and drag column borders to resize (when a table is selected)</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Using the Editor</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Simply click anywhere in the editor and start typing to add or edit content</li>
                    <li>Select text and use toolbar buttons to apply formatting</li>
                    <li>Use keyboard shortcuts for faster editing (Ctrl+B for bold, Ctrl+I for italic, etc.)</li>
                    <li>Tables will automatically scroll within their container if they become too wide</li>
                    <li><strong>Remember:</strong> Click "Back" to save a draft, or use "Save" to create a permanent project</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">5. Saving Your Work</h3>
              <div className="ml-4 space-y-3">
                <div>
                  <h4 className="text-xl font-semibold mb-2">Draft Saving</h4>
                  <p className="text-muted-foreground mb-2">
                    When you're working on a document in the "Create New" page and click the "Back" button, your current work is automatically saved as a draft. This helps prevent data loss if you need to navigate away from your editing session.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Drafts are only created when you click the "Back" button while editing</li>
                    <li>Drafts are saved with a timestamp and the original file name</li>
                    <li>You can access all your drafts from the "Drafts" page in the navigation</li>
                    <li>Drafts are temporary backups - they're meant to prevent data loss, not for long-term storage</li>
                    <li><strong>Important:</strong> If you close the browser without clicking "Back", your work will not be saved as a draft. Always use the "Save" button for important work.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Saving Projects (Create New or Merge)</h4>
                  <p className="text-muted-foreground mb-2">
                    When you're satisfied with your document and want to keep it permanently, click the "Save" button in the editor. You'll see two options:
                  </p>
                  <div className="ml-4 space-y-3">
                    <div>
                      <p className="text-muted-foreground font-semibold mb-1">Create New Project:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                        <li>Click "Create New Project" to save your current work as a brand new project</li>
                        <li>You'll be prompted to enter a custom name for your project</li>
                        <li>The project name must be unique - you can't use a name that already exists</li>
                        <li>This creates a separate, independent project in your saved projects</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold mb-1">Merge into Existing Project:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                        <li>If you have existing saved projects, you'll see a list of them below the "Create New Project" button</li>
                        <li>Click on any existing project name to merge your current content into that project</li>
                        <li>Your current content will be appended to the end of the selected project</li>
                        <li>This is perfect for combining multiple document extractions into one master document</li>
                        <li>The merged project's "Last Updated" date will be updated to reflect the merge</li>
                        <li><strong>Use Case:</strong> Extract pages 1-5 from a PDF and save as "My Report", then extract pages 6-10 and merge into "My Report" to create a complete document</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-semibold mb-1">Project Management:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                        <li>All saved projects are stored in your browser's local storage on your device</li>
                        <li>You can access, edit, or delete saved projects from the "Saved" page</li>
                        <li>When you open a saved project for editing, you can update it and save again to overwrite the existing content</li>
                        <li>Projects persist even if you clear your browser cache (unless you specifically clear local storage)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">6. Exporting Your Document</h3>
              <p className="text-muted-foreground mb-3">
                Once you're happy with your content, click the "Export" button to download your document in various formats.
              </p>
              <div className="ml-4 space-y-2">
                <p className="text-muted-foreground">
                  <strong>Available Export Formats:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li><strong>HTML:</strong> Download as an HTML file that can be opened in any web browser</li>
                  <li><strong>Markdown:</strong> Download as a Markdown (.md) file for use in other markdown-compatible tools</li>
                  <li><strong>DOCX:</strong> Download as a Microsoft Word document (.docx) that can be opened in Word, Google Docs, or other word processors</li>
                  <li><strong>PDF:</strong> Download as a PDF file. Note: The PDF generation may take a moment as it wakes up the generation server</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  <strong>Copy Options:</strong> You can also copy your content as HTML or Markdown to paste into other applications.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Understanding the Application's Pages</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-3">Extract Text (Main Page)</h3>
              <p className="text-muted-foreground mb-3">
                This is the main landing page where you start your journey. From here, you can:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>Click "Get Started" to begin uploading and processing a new document</li>
                <li>Learn about the basic workflow: Upload → Extract → Edit → Export</li>
                <li>Access the main features of the application</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">Create New / Upload Page</h3>
              <p className="text-muted-foreground mb-3">
                This is where you upload your files and process them. The page guides you through several steps:
              </p>
              <div className="ml-4 space-y-2 text-muted-foreground">
                <p><strong>Step 1 - Upload:</strong> Drag and drop or click to select your PDF or image files</p>
                <p><strong>Step 2 - Select Pages (PDF only):</strong> Choose which pages to process (up to 5 pages)</p>
                <p><strong>Step 3 - Processing:</strong> Watch as the AI extracts and formats your text</p>
                <p><strong>Step 4 - Edit:</strong> Review and edit the extracted content using the rich text editor</p>
              </div>
              <p className="text-muted-foreground mt-3">
                During editing, you can use the "Start Over" button to begin with a new file, "Preview" to see how your content looks, "Save" to save your project, and "Export" to download in various formats.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">Drafts Page</h3>
              <p className="text-muted-foreground mb-3">
                The Drafts page shows work that was saved when you clicked the "Back" button while editing. Each draft card displays:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>The original file name</li>
                <li>A timestamp showing when it was saved (when you clicked "Back")</li>
                <li>A preview of the content (first 100 characters)</li>
                <li>Options to open, edit, or delete the draft</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <strong>Important:</strong> Drafts are only created when you click the "Back" button. If you close the browser without clicking "Back", your work will not be saved as a draft. Drafts are temporary backups - if you want to keep your work permanently, make sure to use the "Save" button in the editor to create a saved project.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">Saved Page</h3>
              <p className="text-muted-foreground mb-3">
                This is your personal library of projects that you've manually saved. Features include:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li><strong>Search:</strong> Use the search bar to quickly find saved projects by name or file name</li>
                <li><strong>Project Cards:</strong> Each saved project shows its name, original file name, creation date, and last update date</li>
                <li><strong>Actions:</strong> Open a project to continue editing, or delete projects you no longer need</li>
                <li><strong>Organization:</strong> All your saved work in one place, organized by when you saved it</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                When you open a saved project, it loads in the editor where you can make changes and save again to update it.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">Editor Page</h3>
              <p className="text-muted-foreground mb-3">
                The editor is where you work on your documents. It can be accessed:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>After processing a new document (automatically opens)</li>
                <li>By opening a draft from the Drafts page</li>
                <li>By opening a saved project from the Saved page</li>
                <li>By clicking "Start from Scratch" to create a new empty document</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                The editor features a sticky toolbar at the top with all formatting options, and the main editing area below where you can type and edit your content.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Limits and Restrictions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-xl font-semibold mb-2">File Size Limit</h3>
              <p className="text-muted-foreground">
                Maximum file size: <strong>${MAX_FILE_SIZE_MB}MB per file</strong>. If your file is larger, consider splitting it or compressing it first.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Page Processing Limit</h3>
              <p className="text-muted-foreground">
                You can process up to <strong>${MAX_PAGES_ALLOWED} pages at a time</strong> per upload. If you need to process more pages, simply upload the same PDF again and select the next batch of pages.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Generation Limit</h3>
              <p className="text-muted-foreground">
                You have <strong>${MAX_PDF_GENERATIONS} generations</strong> available. Each time you upload and process a file (PDF or images), it counts as one generation. This limit helps ensure fair usage for all users.
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