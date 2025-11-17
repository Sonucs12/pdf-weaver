# PDFWrite

## Project Title & Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://www.javascript.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## Description

The `pdf-weaver` project is a Next.js-based application designed to streamline the process of converting PDF documents and images into editable Markdown. Leveraging AI, it intelligently extracts text, recognizes document structure, and provides a rich text editing experience.

It has been designed for developers, writers, and content creators who need to seamlessly convert PDFs, scanned documents, and even handwritten notes into editable Markdown. The application allows users to edit, format, and export content, integrating directly into existing workflows. Cloud synchronization using Supabase is planned for future development.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Important Links](#important-links)
- [Footer](#footer)

## Features ✨

- **PDF and Image Upload**: Supports both PDF and image file uploads.
- **Intelligent Text Extraction**: Utilizes AI to extract and format text from PDFs and images.
- **Page Range Selection**: Allows users to select specific pages or page ranges to process.
- **WYSIWYG Editor**: Provides a rich text editor based on Tiptap for editing and formatting extracted content.
- **Markdown Preview**: Offers live Markdown and HTML previews with syntax highlighting.
- **Export Options**: Supports exporting content to various formats, including Markdown, HTML, DOCX and PDF.
- **Draft Saving**: Automatically saves drafts when navigating back, preventing data loss.
- **Cloud Sync with Supabase (Coming Soon)**: Will allow users to access saved projects from any device.
- **Local Storage**: Saved projects are stored locally in the browser for offline access.
- **Theme Support**: Light and Dark theme support using Next Themes.

## Tech Stack 💻

- **Framework**: React, Next.js
- **Language**: TypeScript, JavaScript
- **Styling**: Tailwind CSS, Tailwind CSS-animate
- **AI**: Genkit
- **Editor**: Tiptap
- **Database (Planned)**: Supabase
- **PDF Processing**: pdf-lib, pdfjs-dist
- **Other**: Node.js, Express (implied by Genkit)

## Installation ⚙️

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Sonucs12/pdf-weaver.git
    cd pdf-weaver
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root directory and add the following:

    ```
    GEMINI_API_KEY=<your_gemini_api_key>
    NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
    SUPABASE_SERVICE_KEY=<your_supabase_service_key>
    ```

    *   Replace placeholders with your actual API keys and Supabase credentials.

4.  **Run patch-package (if necessary):**

    ```bash
    npx patch-package
    ```

5. **Configure Firebase:**
	* It is assumed that the project may integrate with Firebase, ensure necessary config is in place

## Usage 🚀

1.  **Run the development server:**

    ```bash
    npm run dev
    ```

2.  **Access the application**: Open your browser and navigate to `http://localhost:9002`.

3.  **Extract Text from PDF**: Navigate to the `/extract-text` route, then to `/extract-text/create-new`.
	* Upload the PDF or images you wish to process.
	* Select page ranges in the PDF.
	* Click "Process Pages" to extract the content using AI.

4.  **Edit Extracted Text**: Once processing is complete, you'll be directed to the editor where you can modify the extracted Markdown content.

5.  **Export**: Export to various file formats including Markdown, HTML, DOCX and PDF.

### Real-World Use Cases

*   **Convert Scanned PDFs**: Transform scanned PDFs or handwritten notes into editable text.
*   **Content Repurposing**: Extract content from PDFs for use in blogs, articles, or other documents.
*   **Document Summarization**: Summarize lengthy PDF documents into concise Markdown notes.

## How to Use ✍️

1.  **Create New**: Use the `/extract-text/create-new` route to upload and process documents.
2.  **Edit Drafts**: Access and modify automatically saved drafts from the `/extract-text/draft` route.
3.  **Saved Documents**: Manage and edit saved projects through the `/extract-text/saved` route.
4.  **Editor**: Edit and format your contents using the WYSIWYG editor at `/extract-text/editor`.

### Configuration Examples

*   **Set API keys**: Ensure your `.env.local` file has valid API keys for Genkit and Supabase.

## Project Structure 📂

```
pdf-weaver/
├── .idx/
├── .next/
├── .vscode/
├── apphosting.yaml
├── components.json
├── docs/
├── LICENSE
├── next-sitemap.config.js
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public/
├── src/
│   ├── ai/
│   ├── app/
│   ├── components/
│   ├── extensions/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── types/
├── tailwind.config.ts
├── tsconfig.json
└── yarn.lock
```

Key Directories:
* **/src/ai**: Contains AI-related flows and configurations using Genkit.
* **/src/app**: Main Next.js application directory with routes and pages.
* **/src/components**: Reusable React components.
* **/src/lib**: Utility functions and configurations.
* **/src/workers**: Web worker scripts for background tasks.

## API Reference 📚

The project utilizes Genkit for AI flows. Key API endpoints and functions include:

*   **`src/ai/flows/index.ts`**: Exports the `extractAndFormatPages` function.
*   **`src/ai/flows/extract-and-format.ts`**: Defines the `extractAndFormatPages` flow for text extraction and formatting.
*   **`src/ai/genkit.ts`**: Manages Genkit configurations and API key handling.

The application leverages Supabase for potential cloud sync features. Check the `.env.local` file and `src/lib/supabase.ts` for Supabase client setup.

## Contributing 🤝

Contributions are welcome! Here's how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Implement your changes.
4.  Submit a pull request.

## License 📜

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Important Links 🔗

- **Repository**: [https://github.com/Sonucs12/pdf-weaver](https://github.com/Sonucs12/pdf-weaver)

## Footer



PDF-weaver - <https://github.com/Sonucs12/pdf-weaver> - Made with ❤️ by [sonucs12](https://github.com/Sonucs12) - Contribute, Like, Star, or raise Issues!



---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**
