import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Link2 } from 'lucide-react';
import HoverLink from './HoverLink';

function cleanMessyMarkdown(rawText: string) {
  return rawText
    // 1. Remove the opening and closing <p> tags
    .replace(/<\/?p>/g, '')
    // 2. Add double line breaks before any Heading (##)
    .replace(/(#{1,6}\s)/g, '\n\n$1')
    // 3. NEW: Split the heading title from the paragraph text
    // Looks for a lowercase letter, a space, and an Uppercase letter right after a heading
    .replace(/(#{1,6}.+?[a-z])\s([A-Z])/g, '$1\n\n$2')
    // 4. Add a line break before any bullet point (*)
    .replace(/(\*\s\*\*)/g, '\n$1')
    // 5. NEW: Fix unclosed code blocks by forcing text after closing backticks to a new line
    // This finds ``` followed by spaces and text, and pushes the text down
    .replace(/```[ \t]+([^`\n]+)/g, '```\n\n$1')
    // 6. NEW: Ensure closing backticks aren't stuck to the end of a line of code
    // This finds a character immediately followed by ``` and pushes the backticks down
    .replace(/([^\n])```(?!\w)/g, '$1\n```\n\n');
}

export default function BlogRenderer({ content }: { content: string }) {
  // Apply fallback HTML stripping and markdown correction
  const formattedContent = cleanMessyMarkdown(content || '');

  // Clean up "Reference: " or "*Reference: " prefixes and join to previous paragraph
  const cleanedContent = formattedContent
    .replace(/[\s\n]*\*?Reference:\s*/gim, ' ') 
    .replace(/\)\*/g, ')');

  return (
    // The 'prose' class handles all the spacing, fonts, and image sizing automatically
    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-strong:text-slate-900 markdown-body dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // This custom component intercepts code blocks to apply syntax highlighting
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              // For inline code snippets (like `const x = 1`)
              <code className="bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 text-primary-700 font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
          blockquote({ node, children }: any) {
            return (
              <div className="flex justify-end my-6 not-prose">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm">
                  <Link2 size={16} className="text-primary-500" />
                  <span className="[&>p]:m-0 [&>a]:text-primary-600 [&>a]:dark:text-primary-400 [&>a]:no-underline hover:[&>a]:underline font-outfit">
                    {children}
                  </span>
                </div>
              </div>
            );
          },
          h2: ({node, ...props}) => <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-2xl font-black text-slate-900 mt-10 mb-4" {...props} />,
          p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-slate-600 text-lg" {...props} />,
          ul: ({node, ...props}) => <ul className="mb-8 space-y-3" {...props} />,
          li: ({node, ...props}) => <li className="ml-6 list-disc text-slate-600 text-lg" {...props} />,
          a: ({node, ...props}) => {
            return <HoverLink {...props} />;
          },
          strong: ({node, ...props}) => <strong className="font-black text-slate-900" {...props} />,
          // You can also customize how images render here if you want to use Next.js <Image /> tags
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
