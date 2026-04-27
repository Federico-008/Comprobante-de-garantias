"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';
import { AlertTriangle } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface EditorPlantillaProps {
  initialValue: string;
  onChange: (value: string) => void;
  disabled?: boolean; // Cuando true → solo permite ELIMINAR contenido, no agregar
}

// Extrae solo el texto plano para comparar longitudes
const getTextLength = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;

export default function EditorPlantilla({ initialValue, onChange, disabled = false }: EditorPlantillaProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (content: string) => {
    if (disabled) {
      // En modo overflow: SOLO permitir si el texto nuevo es más corto (se eliminó algo)
      const newLen = getTextLength(content);
      const curLen = getTextLength(value);
      if (newLen >= curLen) return; // Bloquear adiciones y cambios neutros
    }
    setValue(content);
    onChange(content);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  return (
    <div className="rounded-md overflow-hidden border border-gray-300">
      {/* Banner de advertencia — SOLO visible cuando hay overflow */}
      {disabled && (
        <div className="px-3 py-2 border-b border-red-200 bg-red-50 text-sm flex items-center gap-2 text-red-700">
          <AlertTriangle size={15} className="shrink-0 text-red-500" />
          <span className="font-semibold">Límite de página alcanzado.</span>
          <span className="font-normal">Solo puedes eliminar texto hasta recuperar espacio.</span>
        </div>
      )}

      {/* Ayuda de variables — solo visible cuando NO hay overflow */}
      {!disabled && (
        <div className="px-3 py-1.5 border-b border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center gap-2">
          <span className="font-medium text-gray-600">Variables:</span>
          <code className="bg-gray-200 px-1 rounded">{`{{nombre_cliente}}`}</code>
          <code className="bg-gray-200 px-1 rounded">{`{{numero_serie}}`}</code>
        </div>
      )}

      {/* Editor */}
      <div className={`bg-white text-black ${disabled ? 'ring-2 ring-red-200 ring-inset' : ''}`}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          readOnly={false}
          className="h-[300px] pb-[42px]"
        />
      </div>
    </div>
  );
}
