"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownMessageProps {
    content: string;
    className?: string;
}

export function MarkdownMessage({ content, className = "" }: MarkdownMessageProps) {
    const components: Components = {
        // Code blocks
        code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const inline = !props.node || props.node.position?.start.line === props.node.position?.end.line;
            
            return !inline && match ? (
                <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md my-2"
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200" {...props}>
                    {children}
                </code>
            );
        },
        // Links
        a({ children, ...props }) {
            return (
                <a 
                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    {...props}
                >
                    {children}
                </a>
            );
        },
        // Lists - improved indentation
        ul({ children, ...props }) {
            return <ul className="list-disc pl-5 my-2 space-y-1 text-gray-800" {...props}>{children}</ul>;
        },
        ol({ children, ...props }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1 text-gray-800" {...props}>{children}</ol>;
        },
        li({ children, ...props }) {
            return <li className="pl-1" {...props}>{children}</li>;
        },
        // Paragraphs
        p({ children, ...props }) {
            return <p className="mb-2 last:mb-0 leading-relaxed text-gray-800" {...props}>{children}</p>;
        },
        // Headings
        h1({ children, ...props }) {
            return <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 border-b pb-1" {...props}>{children}</h1>;
        },
        h2({ children, ...props }) {
            return <h2 className="text-lg font-bold mt-3 mb-2 text-gray-900" {...props}>{children}</h2>;
        },
        h3({ children, ...props }) {
            return <h3 className="text-base font-bold mt-2 mb-1 text-gray-900" {...props}>{children}</h3>;
        },
        h4({ children, ...props }) {
            return <h4 className="text-sm font-bold mt-2 mb-1 text-gray-900" {...props}>{children}</h4>;
        },
        // Blockquotes
        blockquote({ children, ...props }) {
            return (
                <blockquote 
                    className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600 bg-gray-50 py-1 pr-2 rounded-r-sm" 
                    {...props}
                >
                    {children}
                </blockquote>
            );
        },
        // Tables
        table({ children, ...props }) {
            return (
                <div className="overflow-x-auto my-3 rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200" {...props}>
                        {children}
                    </table>
                </div>
            );
        },
        thead({ children, ...props }) {
            return <thead className="bg-gray-50" {...props}>{children}</thead>;
        },
        tbody({ children, ...props }) {
            return <tbody className="bg-white divide-y divide-gray-200" {...props}>{children}</tbody>;
        },
        tr({ children, ...props }) {
            return <tr className="hover:bg-gray-50/50 transition-colors" {...props}>{children}</tr>;
        },
        th({ children, ...props }) {
            return (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props}>
                    {children}
                </th>
            );
        },
        td({ children, ...props }) {
            return (
                <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap" {...props}>
                    {children}
                </td>
            );
        },
        // Extra HTML tags support (via rehype-raw, but also explicit overrides for safety/styling)
        strong({ children, ...props }) {
            return <strong className="font-semibold text-gray-900" {...props}>{children}</strong>;
        },
        hr({ ...props }) {
            return <hr className="my-4 border-gray-200" {...props} />;
        }
    };

    return (
        <div className={`text-sm leading-relaxed ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
