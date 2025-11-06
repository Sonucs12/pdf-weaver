import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Zap, Eye } from 'lucide-react';

export default function ExtractTextLandingPage() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Extract Text from PDFs with Ease
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Our powerful tool allows you to upload a PDF and extract the text content, which you can then edit, format, and export.
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
  );
}
