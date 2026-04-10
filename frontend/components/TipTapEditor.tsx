'use client';

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import { Markdown } from 'tiptap-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
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
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// ─── Shared small toolbar button ───
const ToolbarBtn = ({ onClick, active, icon: Icon, label, size = 15 }: any) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center ${active
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

export interface AuditIssue {
  id?: string;
  message: string;
  location_snippet: string;
}

const TipTapMarkdownEditor = forwardRef(({ content, onChange }: any, ref) => {
  const [mounted, setMounted] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  useImperativeHandle(ref, () => ({
    navigateToIssue: (issue: AuditIssue) => {
      if (!editor) return;

      const doc = editor.state.doc;
      let foundPos = -1;
      let matchedQuery = "";

      // Setup resilient search queries
      const queries = [];
      if (issue.location_snippet) queries.push(issue.location_snippet);

      // Fallback 1: extract single/double quoted text from the message
      const quoteMatch = issue.message?.match(/['"]([^'"]+)['"]/);
      if (quoteMatch) queries.push(quoteMatch[1]);

      // Fallback 2: The message itself
      if (issue.message) queries.push(issue.message);

      // Fallback 3: ProseMirror node-crosser (Target first significant multi-word fragment if split by bolding)
      if (issue.location_snippet) {
        const words = issue.location_snippet.split(/[^a-zA-Z0-9]+/).filter(w => w.length > 3);
        if (words.length > 1) queries.push(words.slice(0, 2).join(' ')); // first phrase
        if (words.length > 0) queries.push(words[0]); // extreme fallback (just get me to the paragraph)
      }

      for (const query of queries) {
        if (!query || foundPos !== -1) continue;
        const normalizedQuery = query.toLowerCase().trim();
        if (!normalizedQuery) continue;

        doc.descendants((node, pos) => {
          if (foundPos !== -1) return false;
          if (node.isText) {
            const textContent = (node.text || '').toLowerCase();
            const index = textContent.indexOf(normalizedQuery);
            if (index !== -1) {
              foundPos = pos + index;
              matchedQuery = query.trim();
              return false;
            }
          }
          return true;
        });
      }

      if (foundPos !== -1) {
        editor.commands.setTextSelection({ from: foundPos, to: foundPos + matchedQuery.length });
        editor.commands.focus();

        setTimeout(() => {
          const dom = editor.view.domAtPos(foundPos).node as HTMLElement;
          if (dom) {
            const element = dom.nodeType === 3 ? dom.parentElement : dom;
            if (element) {
              // Use native scrollIntoView which inherently handles nested overflow containers
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });

              gsap.fromTo(element,
                { backgroundColor: 'rgba(253, 224, 71, 0.6)', scale: 1.02 },
                { backgroundColor: 'transparent', scale: 1, duration: 2, ease: 'power2.out', delay: 0.1 }
              );
            }
          }
        }, 50);
      }
    }
  }));

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
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text) return;

    setIsAiLoading(true);
    try {
      const { rewritten_text } = await apiClient.editSnippet(text, aiInstruction);
      editor.chain().focus().insertContent(rewritten_text).run();
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

      {/* ═══ HOVER-TRIGGERED GUTTER TOOLBAR (Notion Style) ═══ */}
      {editor && editor.view && (
        <FloatingMenu
          editor={editor}
          // @ts-ignore - TipTap version specific prop definition
          tippyOptions={{ duration: 150, offset: [-30, 0], placement: 'left-start' }}
          className="z-50 flex items-center group relative h-8"
          shouldShow={({ state, editor: innerEditor }) => {
            const { selection } = state;
            return (
              innerEditor.isFocused &&
              selection.empty &&
              selection.$from.parent.type.name === 'paragraph' &&
              selection.$from.parent.textContent === ''
            );
          }}
        >
          {/* Default Plus Icon */}
          <div className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 transition-colors cursor-pointer group-hover:bg-slate-100 border border-slate-200 shadow-sm opacity-50 group-hover:opacity-100">
            <Plus size={14} className="transition-transform duration-300 group-hover:rotate-90" />
          </div>

          {/* Expands on Hover */}
          <div className="absolute left-8 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 origin-left flex items-center gap-2">
            <div className="flex bg-white border border-slate-200/80 rounded-xl shadow-xl shadow-slate-900/10 p-1 backdrop-blur-xl shrink-0">
               <div className="flex items-center gap-0.5 flex-nowrap">
                 <FormatButtons compact wrapWith={runCommand} />
                 <Sep />
                 <button
                   type="button"
                   onMouseDown={(e) => { e.preventDefault(); runCommand(() => setShowAiInput(!showAiInput)); }}
                   className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${showAiInput ? 'bg-primary-600 text-white' : 'text-primary-600 hover:bg-primary-50'}`}
                   title="AI Generate"
                 >
                   <Sparkles size={14} />
                   <span className="text-[9px] font-black uppercase tracking-wider">AI</span>
                 </button>
               </div>
            </div>
            
            {/* AI Input Row - Animating Horizontally */}
            <AnimatePresence>
              {showAiInput && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex border border-slate-200 bg-white rounded-xl shadow-xl overflow-hidden shrink-0"
                >
                  <div className="flex items-center gap-2 p-1 min-w-[300px]">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium text-slate-800 placeholder:text-slate-400"
                      placeholder="Ask AI to write..."
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
                      className="p-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                    >
                      {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    </button>
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
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${showAiInput
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
            <div className="flex items-center gap-2 px-2 py-2 bg-slate-50 border-t border-slate-100">
              <input
                type="text"
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-800 placeholder:text-slate-400 min-w-[220px]"
                placeholder="e.g. Make this more concise..."
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
                className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors shadow-sm"
              >
                {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              </button>
            </div>
          )}
        </BubbleMenu>
      )}

      {/* ═══ EDITOR CONTENT ═══ */}
      <div className="bg-white transition-colors duration-500 min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

TipTapMarkdownEditor.displayName = 'TipTapMarkdownEditor';
export default TipTapMarkdownEditor;
