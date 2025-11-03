"use client";

import MarkdownIt from "markdown-it";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function Preview({ markdown }: { markdown: string }) {
  const html = md.render(markdown);

  return (
    <Tabs defaultValue="preview" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="preview">HTML Preview</TabsTrigger>
        <TabsTrigger value="markdown">Markdown</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="mt-2 flex-1">
        <Card className="h-full">
          <ScrollArea className="h-full">
            <CardContent className="p-4">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </CardContent>
          </ScrollArea>
        </Card>
      </TabsContent>
      <TabsContent value="markdown" className="mt-2 flex-1">
        <Card className="h-full">
           <ScrollArea className="h-full">
            <CardContent className="p-4">
              <pre className="text-sm whitespace-pre-wrap font-code">
                <code>{markdown}</code>
              </pre>
            </CardContent>
          </ScrollArea>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
