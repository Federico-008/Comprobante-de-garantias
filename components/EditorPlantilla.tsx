"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';
import { AlertCircle, Code, Info } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface EditorPlantillaProps {
  initialValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const getTextLength = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;

export default function EditorPlantilla({ initialValue, onChange, disabled = false }: EditorPlantillaProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (content: string) => {
    if (disabled) {
      const newLen = getTextLength(content);
      const curLen = getTextLength(value);
      if (newLen >= curLen) return;
    }
    setValue(content);
    onChange(content);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-white dark:bg-black/40 transition-all focus-within:ring-2 focus-within:ring-sapphire-500/20">
      {/* Warning Banner */}
      {disabled && (
        <div className="px-5 py-3 border-b border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-[11px] flex items-center gap-3 text-red-600 dark:text-red-400 font-bold uppercase tracking-wider animate-pulse">
          <AlertCircle size={16} className="shrink-0" />
          <span>Límite de espacio crítico. Reduce el contenido.</span>
        </div>
      )}

      {/* Helper Bar */}
      {!disabled && (
        <div className="px-5 py-3 border-b border-border/30 bg-obsidian-50/50 dark:bg-white/5 text-[10px] text-obsidian-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-obsidian-400 uppercase tracking-[0.15em] text-[9px]">
               <Info size={12} className="text-sapphire-500" /> Etiquetas dinámicas
            </div>
            <div className="flex gap-2">
              <code className="bg-white dark:bg-white/10 px-2 py-1 rounded-lg border border-border/50 text-obsidian-700 dark:text-obsidian-200 font-mono font-bold shadow-sm">{`{{nombre_cliente}}`}</code>
              <code className="bg-white dark:bg-white/10 px-2 py-1 rounded-lg border border-border/50 text-obsidian-700 dark:text-obsidian-200 font-mono font-bold shadow-sm">{`{{cf_number}}`}</code>
            </div>
          </div>
          <Code size={14} className="text-obsidian-300 dark:text-obsidian-600" />
        </div>
      )}

      {/* Editor Surface */}
      <div className={`dark:bg-white transition-opacity ${disabled ? 'opacity-80 grayscale-[0.5]' : ''}`}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          readOnly={false}
          className="h-[320px] pb-[42px] font-sans"
        />
      </div>
      
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid rgba(var(--border), 0.3) !important;
          background: transparent !important;
          padding: 8px 16px !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        .ql-editor {
          padding: 20px 24px !important;
          min-height: 250px !important;
          color: #000 !important;
        }
        .dark .ql-editor {
           /* Keep white background for editing for visibility of final PDF look */
           background: #fff !important;
        }
      `}</style>
    </div>
  );
}
