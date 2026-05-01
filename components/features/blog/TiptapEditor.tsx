'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    // Required for Next.js 15 App Router — evite les hydration mismatches.
    // Tiptap rend cote client uniquement, donc on desactive le rendu immediat (SSR).
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Placeholder.configure({ placeholder: placeholder || 'Ecris ton article ici...' }),
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: { attributes: { class: 'tiptap-content outline-none min-h-[200px] text-sm text-gray-900 leading-relaxed' } },
  });

  if (!editor) return null;

  const btn = (active: boolean, onClick: () => void, label: React.ReactNode) => (
    <button type="button" onClick={onClick}
      className={`p-1.5 rounded text-sm transition ${active ? 'bg-sage/20 text-sage' : 'text-gray-500 hover:bg-gray-100'}`}>
      {label}
    </button>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <span className="font-bold">B</span>)}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <span className="italic">I</span>)}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <span className="underline">U</span>)}
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <span className="font-bold text-xs">H2</span>)}
        {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <span className="font-bold text-xs">H3</span>)}
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <span className="text-xs">&#8226;&#8801;</span>)}
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        {btn(false, () => editor.chain().focus().undo().run(), <ArrowUturnLeftIcon className="w-3.5 h-3.5" />)}
        {btn(false, () => editor.chain().focus().redo().run(), <ArrowUturnRightIcon className="w-3.5 h-3.5" />)}
      </div>
      {/* Editor */}
      <EditorContent editor={editor} className="px-3 py-2.5" />
      <style>{`
        .tiptap-content h2 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .tiptap-content h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .tiptap-content p { margin-bottom: 0.75rem; }
        .tiptap-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .tiptap-content li { margin-bottom: 0.25rem; }
        .tiptap-content strong { font-weight: 700; }
        .tiptap-content em { font-style: italic; }
        .tiptap-content u { text-decoration: underline; }
        .tiptap .is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  );
}
