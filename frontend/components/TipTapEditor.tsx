'use client';

import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import { Markdown } from 'tiptap-markdown';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  Quote,
  Strikethrough,
  ListOrdered,
  Minus,
  Plus,
  Link2,
  Globe,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// ─── Shared small toolbar button ───
const ToolbarBtn = ({ onClick, active, icon: Icon, label, size = 15 }: any) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center ${
      active
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
    }`}
    title={label}
  >
    <Icon size={size} strokeWidth={active ? 2.5 : 2} />
  </button>
);

// ─── Divider between button groups ───
const Sep = () => <div className="w-px h-5 bg-slate-200/60 mx-0.5" />;

// ─── URL detection helper ───
const URL_PATTERN = /https?:\/\/[^\s,;)}\]]+/gi;
const detectUrls = (text: string) => text.match(URL_PATTERN) || [];

export default function TipTapMarkdownEditor({ content, onChange }: any) {
  const [mounted, setMounted] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const detectedUrls = detectUrls(aiInstruction);
  const hasUrl = detectedUrls.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      BubbleMenuExtension,
      FloatingMenuExtension,
      Markdown.configure({
        html: false,
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
    onUpdate: ({ editor }: { editor: any }) => {
      // @ts-ignore - TipTap storage types are dynamic
      const md = editor.storage.markdown.getMarkdown();
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg max-w-none focus:outline-none min-h-[500px] px-16 py-12 transition-all duration-300',
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

  // Utility to clear "/" if present before applying command
  const runCommand = (cmd: () => void) => {
    if (!editor) return;
    const { from } = editor.state.selection;
    const charBefore = editor.state.doc.textBetween(from - 1, from);
    if (charBefore === '/') {
      editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();
    }
    cmd();
  };

  const handleAiEdit = useCallback(async () => {
    if (!editor || !aiInstruction.trim()) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const isGenerateMode = !selectedText;

    // Get the full blog content so AI knows what's already written
    // @ts-ignore - TipTap storage types are dynamic
    const fullContent = editor.storage.markdown.getMarkdown() || '';

    setIsAiLoading(true);
    try {
      const { rewritten_text } = await apiClient.editSnippet(
        selectedText || '',
        aiInstruction,
        fullContent
      );
      if (isGenerateMode) {
        // No selection — insert generated content at cursor position
        editor.chain().focus().insertContent(rewritten_text).run();
      } else {
        // Has selection — replace the selected text
        editor.chain().focus().insertContent(rewritten_text).run();
      }
      setAiInstruction('');
      setShowAiInput(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  }, [editor, aiInstruction]);

  if (!mounted) return <div className="p-20 text-center animate-pulse text-slate-300 font-bold uppercase tracking-widest text-[10px]">Initializing Neural Editor Matrix...</div>;

  // ─── Render the formatting buttons (shared between bubble menu & floating bar) ───
  const FormatButtons = ({ compact = false, wrapWith = (fn: any) => fn() }: { compact?: boolean, wrapWith?: (fn: any) => void }) => (
    <>
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleBold().run())} active={editor?.isActive('bold')} icon={Bold} label="Bold" />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleItalic().run())} active={editor?.isActive('italic')} icon={Italic} label="Italic" />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleStrike().run())} active={editor?.isActive('strike')} icon={Strikethrough} label="Strikethrough" />
      <Sep />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleHeading({ level: 1 }).run())} active={editor?.isActive('heading', { level: 1 })} icon={Heading1} label="Heading 1" />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())} active={editor?.isActive('heading', { level: 2 })} icon={Heading2} label="Heading 2" />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())} active={editor?.isActive('heading', { level: 3 })} icon={Heading3} label="Heading 3" />
      <Sep />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleBulletList().run())} active={editor?.isActive('bulletList')} icon={List} label="Bullet List" />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleOrderedList().run())} active={editor?.isActive('orderedList')} icon={ListOrdered} label="Ordered List" />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleBlockquote().run())} active={editor?.isActive('blockquote')} icon={Quote} label="Quote" />
      <Sep />
      <ToolbarBtn
        onClick={() => wrapWith(() => {
          const url = prompt("Enter hyperlink source:");
          if (url) editor?.chain().focus().setLink({ href: url }).run();
        })}
        active={editor?.isActive('link')}
        icon={LinkIcon}
        label="Link"
      />
      <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().toggleCodeBlock().run())} active={editor?.isActive('codeBlock')} icon={Code} label="Code Block" />
      {!compact && (
        <>
          <ToolbarBtn
            onClick={() => wrapWith(() => {
              const url = prompt("Enter image source URL:");
              if (url) editor?.chain().focus().setImage({ src: url }).run();
            })}
            active={false}
            icon={ImageIcon}
            label="Image"
          />
          <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().setHorizontalRule().run())} active={false} icon={Minus} label="Horizontal Rule" />
          <Sep />
          <ToolbarBtn onClick={() => wrapWith(() => editor?.chain().focus().unsetAllMarks().run())} active={false} icon={RotateCcw} label="Clear Formatting" />
        </>
      )}
    </>
  );

  return (
    <div className="relative group">
      {/* ═══ FIXED TOP TOOLBAR — always reachable ═══ */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-xl border-b border-slate-200/60 px-4 py-2 flex gap-1 flex-wrap items-center">
        <FormatButtons />
      </div>

      {/* ═══ PERSISTENT GUTTER TOOLBAR — follows the cursor ═══ */}
      {editor && (
        <FloatingMenu
          editor={editor}
          tippyOptions={{ 
            duration: 100, 
            offset: [0, 10], // Aligned with standard BubbleMenu height
            placement: 'top' 
          }}
          className="z-50"
          shouldShow={({ state }) => {
            const { selection } = state;
            // Always show the full menu in the gutter for the active line
            return selection.empty && selection.$from.parent.type.name === 'paragraph';
          }}
        >
          <div className="flex flex-col bg-white border border-slate-200/80 rounded-xl shadow-2xl shadow-slate-900/10 overflow-hidden backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center gap-0.5 p-1 max-w-[90vw] flex-wrap bg-white/95">
              <FormatButtons compact wrapWith={runCommand} />
              <Sep />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); runCommand(() => setShowAiInput(!showAiInput)); }}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  showAiInput
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-600 hover:bg-primary-50'
                }`}
                title="AI Rewrite / Generate"
              >
                <Sparkles size={14} />
                <span className="text-[9px] font-black uppercase tracking-wider">AI</span>
              </button>
            </div>

            {/* AI input row embedded — expands when toggled */}
            <AnimatePresence>
              {showAiInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col border-t border-slate-100 bg-slate-50 overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5 px-3 py-2 min-w-[380px]">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className={`flex-1 bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 font-medium text-slate-800 placeholder:text-slate-400 transition-colors ${
                          hasUrl ? 'border-teal-300 focus:ring-teal-500/30' : 'border-slate-200 focus:ring-primary-500'
                        }`}
                        placeholder="Ask AI to edit, or paste a URL to scrape..."
                        value={aiInstruction}
                        onChange={e => setAiInstruction(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAiEdit(); }}
                        disabled={isAiLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAiEdit}
                        disabled={isAiLoading || !aiInstruction.trim()}
                        className={`p-1.5 rounded-lg shadow-sm transition-colors text-white ${
                          hasUrl ? 'bg-teal-600 hover:bg-teal-700' : 'bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : hasUrl ? <Globe size={14} /> : <Sparkles size={14} />}
                      </button>
                    </div>
                    {hasUrl && (
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-teal-600 uppercase tracking-wider">
                        <Link2 size={10} />
                        <span>{isAiLoading ? 'Scraping page content...' : `${detectedUrls.length} URL${detectedUrls.length > 1 ? 's' : ''} detected — will scrape & rewrite`}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FloatingMenu>
      )}

      {/* ═══ MEDIUM-STYLE BUBBLE MENU — appears on text selection ═══ */}
      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex flex-col rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200/80 overflow-hidden backdrop-blur-xl"
        >
          {/* Formatting row */}
          <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white/95">
            <FormatButtons compact />
            <Sep />
            {/* AI rewrite toggle */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowAiInput(!showAiInput); }}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                showAiInput
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
              title="AI Rewrite"
            >
              <Sparkles size={14} />
              <span className="text-[9px] font-black uppercase tracking-wider">AI</span>
            </button>
          </div>

          {/* AI instruction row — only when toggled */}
          {showAiInput && (
            <div className="flex flex-col gap-1.5 px-2 py-2 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className={`flex-1 bg-white border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 font-medium text-slate-800 placeholder:text-slate-400 min-w-[220px] transition-colors ${
                    hasUrl ? 'border-teal-300 focus:ring-teal-500/30' : 'border-slate-200 focus:ring-primary-500'
                  }`}
                  placeholder="Paste a URL or type instructions..."
                  value={aiInstruction}
                  onChange={e => setAiInstruction(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAiEdit(); }}
                  disabled={isAiLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAiEdit}
                  disabled={isAiLoading || !aiInstruction.trim()}
                  className={`p-1.5 rounded-lg disabled:opacity-40 transition-colors shadow-sm text-white ${
                    hasUrl ? 'bg-teal-600 hover:bg-teal-700' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : hasUrl ? <Globe size={14} /> : <Sparkles size={14} />}
                </button>
              </div>
              {hasUrl && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-teal-600 uppercase tracking-wider px-1">
                  <Link2 size={10} />
                  <span>{isAiLoading ? 'Scraping page content...' : `${detectedUrls.length} URL${detectedUrls.length > 1 ? 's' : ''} detected — will scrape & rewrite`}</span>
                </div>
              )}
            </div>
          )}
        </BubbleMenu>
      )}

      {/* ═══ EDITOR CONTENT ═══ */}
      <div className="bg-white transition-colors duration-500 h-[750px] overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
