'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Code,
  ImageIcon,
  LinkIcon,
  RotateCcw,
  Heading3,
  Sparkles,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function TipTapMarkdownEditor({ content, onChange }: any) {
  const [mounted, setMounted] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false, // 🔥 NEW: Strict Markdown mode
        tightLists: true,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: 'text-primary-600 underline' },
      }),
      Image,
    ],
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // @ts-ignore - TipTap storage types are dynamic
      const md = editor.storage.markdown.getMarkdown();
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg max-w-none focus:outline-none min-h-[400px] px-8 py-10 transition-all duration-300',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      // @ts-ignore - TipTap storage types are dynamic
      const currentMd = editor.storage.markdown.getMarkdown();
      if (content !== currentMd) {
        editor.commands.setContent(content || "");
      }
    }
  }, [content, editor]);

  if (!mounted) return <div className="p-20 text-center animate-pulse text-slate-300 font-bold uppercase tracking-widest text-[10px]">Initializing Neural Editor Matrix...</div>;

  const ToolbarButton = ({ onClick, active, icon: Icon, label }: any) => (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group ${active
        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        }`}
      title={label}
    >
      <Icon size={16} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
    </button>
  );

  const handleAiEdit = async () => {
    if (!editor || !aiInstruction.trim()) return;

    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text) return;

    setIsAiLoading(true);
    try {
      const { rewritten_text } = await apiClient.editSnippet(text, aiInstruction);
      editor.chain().focus().insertContent(rewritten_text).run();
      setAiInstruction('');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'AI edit failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="relative group">
      {/* Matrix Status Console */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex gap-x-2.5 gap-y-3 flex-wrap items-center">
        <div className="flex gap-2 border-r border-slate-100 pr-4 mr-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
            icon={Bold}
            label="Bold"
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
            icon={Italic}
            label="Italic"
          />
        </div>

        <div className="flex gap-2 border-r border-slate-100 pr-4 mr-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor?.isActive('heading', { level: 1 })}
            icon={Heading1}
            label="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive('heading', { level: 2 })}
            icon={Heading2}
            label="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor?.isActive('heading', { level: 3 })}
            icon={Heading3}
            label="Heading 3"
          />
        </div>

        <div className="flex gap-2 border-r border-slate-100 pr-4 mr-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList')}
            icon={List}
            label="List"
          />
          <ToolbarButton
            onClick={() => {
              const url = prompt("Enter hyperlink source:");
              if (url) editor?.chain().focus().setLink({ href: url }).run();
            }}
            active={editor?.isActive('link')}
            icon={LinkIcon}
            label="Link"
          />
        </div>

        <div className="flex gap-2">
          <ToolbarButton
            onClick={() => {
              const url = prompt("Enter image source URL:");
              if (url) editor?.chain().focus().setImage({ src: url }).run();
            }}
            active={false}
            icon={ImageIcon}
            label="Image"
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            active={editor?.isActive('codeBlock')}
            icon={Code}
            label="Code"
          />
          <button
            onClick={() => editor?.chain().focus().unsetAllMarks().run()}
            className="p-3 rounded-xl border border-slate-50 text-slate-300 hover:text-red-500 hover:border-red-50 transition-all"
            title="Clear Analysis"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* AI Bubble Menu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 min-w-[320px]"
        >
          <input
            type="text"
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-800 placeholder:text-slate-400"
            placeholder="Ask AI to edit this..."
            value={aiInstruction}
            onChange={e => setAiInstruction(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAiEdit(); }}
            disabled={isAiLoading}
          />
          <button
            onClick={handleAiEdit}
            disabled={isAiLoading || !aiInstruction.trim()}
            className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md shadow-primary-500/20"
          >
            {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </button>
        </BubbleMenu>
      )}

      {/* Narrative Buffer Environment */}
      <div className="bg-white group-hover:bg-slate-50/30 transition-colors duration-1000">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
