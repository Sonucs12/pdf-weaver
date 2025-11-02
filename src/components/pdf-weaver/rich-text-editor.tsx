    'use client';

import { memo, useRef, useEffect, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = memo(
  ({ content, onChange, placeholder, className }: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isUserTypingRef = useRef(false);
    const lastContentRef = useRef(content);

    useEffect(() => {
      if (
        editorRef.current &&
        content !== editorRef.current.innerHTML &&
        !isUserTypingRef.current &&
        content !== lastContentRef.current
      ) {
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const cursorOffset = range ? range.startOffset : 0;

        editorRef.current.innerHTML = content;
        lastContentRef.current = content;
        
        if (range && editorRef.current.firstChild) {
          try {
            const newRange = document.createRange();
            newRange.setStart(
              editorRef.current.firstChild,
              Math.min(
                cursorOffset,
                editorRef.current.firstChild.textContent?.length || 0
              )
            );
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          } catch (e) {
            const newRange = document.createRange();
            newRange.selectNodeContents(editorRef.current);
            newRange.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        }
      }
    }, [content]);

    const handleInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        isUserTypingRef.current = true;
        const newHtml = e.currentTarget.innerHTML;
        lastContentRef.current = newHtml;
        onChange(newHtml);

        setTimeout(() => {
          isUserTypingRef.current = false;
        }, 100);
      },
      [onChange]
    );

    const handleFocus = useCallback(() => {
      isUserTypingRef.current = true;
    }, []);

    const handleBlur = useCallback(() => {
      isUserTypingRef.current = false;
    }, []);

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const paste = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
      
      if (paste) {
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = paste;
        
        // Insert the parsed HTML while preserving formatting
        const fragment = document.createDocumentFragment();
        Array.from(tempDiv.childNodes).forEach(node => {
          fragment.appendChild(node.cloneNode(true));
        });
        
        range.insertNode(fragment);
        
        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger onChange
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    }, [onChange]);

    return (
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        suppressContentEditableWarning
        data-placeholder={placeholder || 'Your formatted text will appear here...'}
        className={`prose dark:prose-invert max-w-none text-base focus-visible:ring-0 px-4 py-3 min-h-[400px] focus:outline-none bg-background overflow-y-auto ${className || ''} ${!content || content === '<p></p>' || content === '<br>' || content.trim() === '' ? 'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none' : ''}`}
      />
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

