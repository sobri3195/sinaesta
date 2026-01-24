import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Table,
  Code2,
  Sigma,
  Stethoscope,
  SpellCheck,
  FileText,
  ClipboardList,
  Sparkles
} from 'lucide-react';

declare global {
  interface Window {
    Quill?: any;
    katex?: any;
    ImageResize?: any;
    QuillBetterTable?: any;
  }
}

export interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  onOpenMediaLibrary?: () => void;
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  label,
  placeholder,
  className,
  minHeight = 'min-h-[220px]',
  onOpenMediaLibrary
}) => {
  const quillRef = useRef<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarId = useId();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const ensureScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src=\"${src}\"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });

    const ensureStyle = (href: string) => {
      if (document.querySelector(`link[href=\"${href}\"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    const loadDependencies = async () => {
      ensureStyle('https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css');
      ensureStyle('https://cdn.jsdelivr.net/npm/quill-better-table@1.2.10/dist/quill-better-table.css');
      ensureStyle('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');
      await ensureScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js');
      await ensureScript('https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js');
      await ensureScript('https://cdn.jsdelivr.net/npm/quill-image-resize-module@3.0.0/image-resize.min.js');
      await ensureScript('https://cdn.jsdelivr.net/npm/quill-better-table@1.2.10/dist/quill-better-table.min.js');
      setIsReady(true);
    };

    loadDependencies();
  }, []);

  useEffect(() => {
    if (!isReady || !editorRef.current || quillRef.current) return;
    const QuillConstructor = window.Quill;
    if (!QuillConstructor) return;

    if (window.ImageResize) {
      QuillConstructor.register('modules/imageResize', window.ImageResize);
    }
    if (window.QuillBetterTable) {
      QuillConstructor.register('modules/better-table', window.QuillBetterTable);
    }
    if (window.katex) {
      window.katex.config({ throwOnError: false });
    }

    quillRef.current = new QuillConstructor(editorRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: {
          container: `#${toolbarId}`,
          handlers: {
            image: () => {
              const url = window.prompt('Paste image URL');
              if (!url) return;
              const range = quillRef.current.getSelection(true);
              const insertAt = range?.index ?? quillRef.current.getLength();
              quillRef.current.insertEmbed(insertAt, 'image', url, 'user');
              quillRef.current.setSelection(insertAt + 1, 0, 'user');
            },
            link: () => {
              const url = window.prompt('Paste link URL');
              if (!url) return;
              const range = quillRef.current.getSelection(true);
              if (!range) return;
              quillRef.current.format('link', url, 'user');
            }
          }
        },
        clipboard: { matchVisual: false },
        history: { delay: 1000, maxStack: 200, userOnly: true },
        formula: true,
        'better-table': {
          operationMenu: {
            items: { unmergeCells: { text: 'Unmerge' } }
          }
        },
        imageResize: {
          modules: ['Resize', 'DisplaySize', 'Toolbar']
        }
      }
    });

    quillRef.current.root.setAttribute('spellcheck', 'true');
    quillRef.current.on('text-change', () => {
      onChange(quillRef.current.root.innerHTML);
    });
    quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
  }, [isReady, onChange, placeholder, toolbarId, value]);

  useEffect(() => {
    if (!quillRef.current) return;
    const currentHtml = quillRef.current.root.innerHTML;
    if (value !== currentHtml) {
      const selection = quillRef.current.getSelection();
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
      if (selection) {
        quillRef.current.setSelection(selection);
      }
    }
  }, [value]);

  const insertSnippet = (snippet: string) => {
    if (!quillRef.current) return;
    const range = quillRef.current.getSelection(true);
    const insertAt = range?.index ?? quillRef.current.getLength();
    quillRef.current.insertText(insertAt, snippet, 'user');
    quillRef.current.setSelection(insertAt + snippet.length, 0, 'user');
  };

  const insertFormula = (formula: string) => {
    if (!quillRef.current) return;
    const range = quillRef.current.getSelection(true);
    const insertAt = range?.index ?? quillRef.current.getLength();
    quillRef.current.insertEmbed(insertAt, 'formula', formula, 'user');
    quillRef.current.setSelection(insertAt + 1, 0, 'user');
  };

  const insertTable = () => {
    if (!quillRef.current) return;
    const tableModule = quillRef.current.getModule('better-table');
    if (tableModule?.insertTable) {
      tableModule.insertTable(3, 4);
    }
  };

  const plainText = stripHtml(value || '');
  const wordCount = plainText ? plainText.split(' ').filter(Boolean).length : 0;
  const charCount = plainText.length;

  return (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      {label && <div className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-2">{label}</div>}

      <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
        <div
          id={toolbarId}
          className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50"
        >
          <span className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button className="ql-bold p-1.5 hover:bg-white rounded" title="Bold">
              <Bold size={14} />
            </button>
            <button className="ql-italic p-1.5 hover:bg-white rounded" title="Italic">
              <Italic size={14} />
            </button>
            <button className="ql-underline p-1.5 hover:bg-white rounded" title="Underline">
              <Underline size={14} />
            </button>
          </span>
          <span className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button className="ql-list p-1.5 hover:bg-white rounded" value="ordered" title="Numbered list">
              <ListOrdered size={14} />
            </button>
            <button className="ql-list p-1.5 hover:bg-white rounded" value="bullet" title="Bullet list">
              <List size={14} />
            </button>
          </span>
          <span className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button className="ql-link p-1.5 hover:bg-white rounded" title="Insert link">
              <Link2 size={14} />
            </button>
            <button className="ql-image p-1.5 hover:bg-white rounded" title="Insert image URL">
              <ImageIcon size={14} />
            </button>
            <button
              type="button"
              onClick={onOpenMediaLibrary}
              className="p-1.5 hover:bg-white rounded text-gray-600"
              title="Open media library"
            >
              <ImageIcon size={14} className="text-indigo-600" />
            </button>
          </span>
          <span className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button type="button" onClick={insertTable} className="p-1.5 hover:bg-white rounded" title="Insert table">
              <Table size={14} />
            </button>
            <button className="ql-code-block p-1.5 hover:bg-white rounded" title="Code block">
              <Code2 size={14} />
            </button>
            <button type="button" onClick={() => insertFormula('\\frac{d}{dx} (e^{x}) = e^{x}')}
              className="p-1.5 hover:bg-white rounded" title="Insert formula">
              <Sigma size={14} />
            </button>
          </span>
          <span className="flex items-center gap-1">
            <button type="button" onClick={() => insertSnippet('SOAP: ')} className="p-1.5 hover:bg-white rounded" title="SOAP template">
              <FileText size={14} />
            </button>
            <button type="button" onClick={() => insertSnippet('Vitals: HR __, BP __/__ , RR __, Temp __')}
              className="p-1.5 hover:bg-white rounded" title="Vitals template">
              <Stethoscope size={14} />
            </button>
            <button type="button" onClick={() => insertSnippet('Lab: Hb __, WBC __, Plt __, Cr __')}
              className="p-1.5 hover:bg-white rounded" title="Lab template">
              <ClipboardList size={14} />
            </button>
            <button type="button" onClick={() => insertFormula('\\text{Dose} = \\frac{Weight(kg) \\times 10}{2}')}
              className="p-1.5 hover:bg-white rounded" title="Medical dose equation">
              <Sparkles size={14} />
            </button>
          </span>
        </div>

        <div
          ref={editorRef}
          className={`bg-white ${minHeight}`}
          style={{ minHeight: minHeight.includes('min-h') ? undefined : '220px' }}
        />

        <div className="flex items-center justify-between text-xs text-gray-500 px-3 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <SpellCheck size={12} />
            <span>Spell check enabled</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
