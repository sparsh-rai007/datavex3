'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

export default function TipTapEditor({ content, onChange }: any) {
  const [mounted, setMounted] = useState(false);

  // Prevent SSR rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
      }),
      Image,
    ],
    content: content || "",
    immediatelyRender: false, // 🔥 FIX for hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Ensure editor updates when editing an existing blog
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!mounted) {
    return <div className="text-gray-400">Loading editor...</div>;
  }

  return (
    <div className="border rounded-lg p-3">
      {/* Toolbar */}
      <div className="border-b pb-2 mb-2 flex gap-2 flex-wrap">

        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className="px-2 py-1 border rounded"
        >
          Bold
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className="px-2 py-1 border rounded"
        >
          Italic
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className="px-2 py-1 border rounded"
        >
          • List
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-2 py-1 border rounded"
        >
          H2
        </button>

        {/* Add Image URL */}
        <button
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) {
              editor?.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="px-2 py-1 border rounded"
        >
          Image
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
}
