"use client";

import { Prism as ReactSyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface SyntaxHighlighterProps {
    language: string;
    code: string;
    wrapLongLines?: boolean;
}

export function SyntaxHighlighter({ language, code, wrapLongLines = false }: SyntaxHighlighterProps) {
    const { theme } = useTheme();

    const style = theme === 'dark' ? oneDark : oneLight;
    
    return (
        <div className="[&_*]:!bg-transparent">
            <ReactSyntaxHighlighter
                language={language}
                style={style}
                showLineNumbers={true}
                wrapLongLines={wrapLongLines}
                customStyle={{
                    borderRadius: '0',
                    padding: '0',
                    margin: '0',
                    background: "transparent",
                    backgroundColor: "transparent",
                  
                }}
            >
                {code}
            </ReactSyntaxHighlighter>
        </div>
    );
}