import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    markdown: {
      getMarkdown: () => ReturnType;
    };
  }
  
  interface Storage {
    markdown: {
      getMarkdown: () => string;
    };
  }
}