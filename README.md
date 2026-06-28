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


