import { ArrowRight, CheckCircle, FileText, Bot, Edit, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/metadata';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-card p-6 rounded-lg border shadow-sm">
    <div className="flex items-center gap-4 mb-3">
      {icon}
      <h3 className="text-xl font-headline font-semibold text-card-foreground">{title}</h3>
    </div>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center bg-background flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-headline font-bold mb-4">
            Unlock Your PDFs. Instantly.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {siteConfig.description} Stop re-typing and start weaving your PDF content into editable, structured markdown with the power of AI.
          </p>
          <Button asChild size="lg">
            <Link href="/extract-text">
              Get Started for Free <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">How It Works in 3 Simple Steps</h2>
            <p className="text-muted-foreground mt-2">From static document to dynamic text in seconds.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
                <span className="font-bold text-2xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Upload Your PDF</h3>
              <p className="text-muted-foreground">Simply drag and drop or select any PDF file from your device.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
                 <span className="font-bold text-2xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Extracts & Formats</h3>
              <p className="text-muted-foreground">Our AI analyzes the structure and content, converting it into clean markdown.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
                 <span className="font-bold text-2xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Edit & Download</h3>
              <p className="text-muted-foreground">Review, edit in our side-by-side editor, and download your new markdown file.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
        <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Packed with Powerful Features</h2>
            <p className="text-muted-foreground mt-2">Everything you need to liberate your documents.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Bot className="h-8 w-8 text-accent" />}
              title="Intelligent Text Extraction"
              description="Goes beyond simple OCR. Our AI understands headings, lists, and paragraphs to maintain your document's original structure."
            />
            <FeatureCard 
              icon={<FileText className="h-8 w-8 text-accent" />}
              title="Page & Range Selection"
              description="Process your entire document or choose specific pages or page ranges (e.g., 2-7) for targeted extraction."
            />
            <FeatureCard 
              icon={<Edit className="h-8 w-8 text-accent" />}
              title="Side-by-Side Editor"
              description="Instantly edit the generated markdown and see a live preview of the formatted output before you download."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-8 w-8 text-accent" />}
              title="Clean Markdown Output"
              description="Get well-structured, readable markdown that's ready to be used in any compatible application like Notion, Obsidian, or your own code."
            />
            <FeatureCard 
              icon={<Download className="h-8 w-8 text-accent" />}
              title="One-Click Download"
              description="Easily download your formatted content as a .md file, named after your original PDF for simple organization."
            />
             <FeatureCard 
              icon={<ArrowRight className="h-8 w-8 text-accent" />}
              title="Light & Dark Mode"
              description="Work comfortably at any time of day with a beautiful, themeable interface that adapts to your preference."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-headline font-bold mb-4">Ready to Weave?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Transform your first PDF into structured, usable markdown in less than a minute. No sign-up required.
          </p>
          <Button asChild size="lg">
            <Link href="/extract-text">
              Try PDFWrite Now <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
