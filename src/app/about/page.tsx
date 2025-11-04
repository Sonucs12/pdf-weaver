'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const features = [
  {
    title: "Seamless PDF to Markdown Conversion",
    description: "Effortlessly upload your PDF documents and watch as PDF Weaver intelligently extracts the text and converts it into clean, editable Markdown. Our powerful engine handles various PDF layouts, preserving the structure of your content.",
    keywords: ["PDF extraction", "Markdown conversion", "text extraction"],
  },
  {
    title: "Advanced WYSIWYG Editor",
    description: "Our state-of-the-art WYSIWYG editor, built with Tiptap, provides a seamless and intuitive writing experience. Format your text with a rich toolbar, and see your changes reflected in real-time. The editor supports a wide range of formatting options, including headings, lists, blockquotes, and more.",
    keywords: ["WYSIWYG editor", "Tiptap", "rich text editing"],
  },
  {
    title: "Live Markdown and HTML Previews",
    description: "Instantly preview your content in both Markdown and HTML formats. Our live preview feature, complete with syntax highlighting, ensures that your final output is exactly as you intended. This is perfect for developers, writers, and content creators who need to switch between different formats.",
    keywords: ["Markdown preview", "HTML preview", "syntax highlighting"],
  },
  {
    title: "Save, Edit, and Merge Projects",
    description: "Never lose your work again. Save your extracted content as projects, which you can revisit and edit at any time. You can even merge new content into existing projects, making it easy to consolidate your work. Each project is saved with a unique title, and you can easily search for them.",
    keywords: ["save projects", "edit content", "merge documents"],
  },
  {
    title: "Cloud Sync with Supabase (Coming Soon)",
    description: "While currently in development, our upcoming cloud sync feature, powered by Supabase, will allow you to access your saved projects from any device. Your data will be securely stored in the cloud, ensuring that you can work from anywhere, at any time.",
    keywords: ["cloud sync", "Supabase", "data persistence"],
  },
  {
    title: "Export to Multiple Formats",
    description: "Export your final content to various formats, including Markdown, HTML, and plain text. This flexibility makes it easy to integrate your content into any workflow, whether you're publishing to a blog, updating a website, or sharing with a colleague.",
    keywords: ["export formats", "Markdown", "HTML"],
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About PDF Weaver</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          PDF Weaver is a powerful tool designed to streamline your workflow by converting PDF documents into editable Markdown. Our mission is to provide a seamless and intuitive experience for developers, writers, and content creators.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                {feature.keywords.map((keyword, i) => (
                  <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
