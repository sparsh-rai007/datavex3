import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// import { Link2 } from 'lucide-react'; // You can remove this if not using the old blockquote link style
import HoverLink from './HoverLink';

function cleanMarkdown(rawText: string) {
  if (!rawText) return '';
  return rawText
    // Just a safety net: Remove opening/closing HTML <p> tags if the AI hallucinated them
    .replace(/<\/?p>/g, '')
    // Clean up random artifacts sometimes left by scraping
    .replace(/\[\s*\]\s*\(/g, '[')
    // Remove "Source: " prefix from blockquotes for a cleaner minimalist feel
    .replace(/^>\s*Source:\s*/gim, '> ')
    .replace(/\n## References[\s\S]*$/g, '')
    // 5. NEW: Fix unclosed code blocks by forcing text after closing backticks to a new line
    // This finds ``` followed by spaces and text, and pushes the text down
    .replace(/```[ \t]+([^`\n]+)/g, '```\n\n$1')
    // 6. NEW: Ensure closing backticks aren't stuck to the end of a line of code
    // This finds a character immediately followed by ``` and pushes the backticks down
    .replace(/([^\n])```(?!\w)/g, '$1\n```\n\n');
}

export default function BlogRenderer({ content }: { content: string }) {
  const cleanedContent = cleanMarkdown(content);

  return (
    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-strong:text-slate-900 markdown-body dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code Block syntax highlighting
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-xl overflow-hidden my-6 shadow-md"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              // Inline code snippets
              <code className="bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 text-primary-700 font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
          
          // Minimalist Reference block: removes gray background and uses a subtle border
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-2 border-slate-200 pl-6 my-8 italic text-slate-500 transition-all hover:border-primary-500/50" {...props} />
          ),

          // Standard text elements
          h2: ({node, ...props}) => <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-2xl font-black text-slate-900 mt-10 mb-4" {...props} />,
          p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-slate-600 text-lg" {...props} />,
          ul: ({node, ...props}) => <ul className="mb-8 space-y-3" {...props} />,
          li: ({node, ...props}) => <li className="ml-6 list-disc text-slate-600 text-lg" {...props} />,
          strong: ({node, ...props}) => <strong className="font-black text-slate-900" {...props} />,
          
          // Your custom HoverLink is perfect for the new paragraph citations!
          a: ({node, ...props}) => {
            return <HoverLink {...props} />;
          },
          
          // Image handling
          img: ({node, ...props}) => (
            <img referrerPolicy="no-referrer" className="rounded-[2rem] shadow-xl my-10 w-full object-cover" {...props} />
          )
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}