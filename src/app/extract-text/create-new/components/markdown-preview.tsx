import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none p-4 mb-16 border rounded-md bg-background/50">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}

