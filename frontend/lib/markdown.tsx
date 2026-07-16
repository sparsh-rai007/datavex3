import React from 'react';

/**
 * Parses inline markdown bold constructs such as **word** or **word (unclosed)
 * and returns React elements/strings with those words made bold.
 */
export function formatMarkdownBold(text: string): React.ReactNode {
  if (!text) return '';

  // Matches either:
  // 1. **text** (closed bold, can contain anything except asterisks)
  // 2. **word (unclosed bold, matches alphanumeric/word/hyphen characters after the asterisks)
  const regex = /(\*\*[^\*]+\*\*|\*\*[a-zA-Z0-9_\-]+)/g;
  
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**')) {
          const cleanWord = part.replace(/\*\*/g, '');
          return (
            <strong key={index} className="font-extrabold text-slate-900">
              {cleanWord}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
}
