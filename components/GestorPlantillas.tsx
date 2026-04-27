"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Pencil, Trash2, Check, X, FileText, ChevronDown } from 'lucide-react';

const EditorPlantilla = dynamic(() => import('@/components/EditorPlantilla'), { ssr: false });

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface Plantilla {
  id: string;
  titulo: string;
  contenido: string;
  creadaEl: string;
}

const STORAGE_KEY = 'garantias_plantillas_v1';

// ─── Helpers localStorage ────────────────────────────────────────────────────
const getPlantillas = (): Plantilla[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const savePlantillas = (items: Plantilla[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// ─── Sub-componente: Selector compacto ───────────────────────────────────────
interface SelectorProps {
  onSelect: (contenido: string) => void;
}

export function SelectorPlantilla({ onSelect }: SelectorProps) {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPlantillas(getPlantillas());
  }, [open]); // Re-leer al abrir

  if (plantillas.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition font-medium"
      >
        <FileText size={14} /> Cargar Plantilla <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 min-w-[240px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 text-xs text-gray-500 font-semibold uppercase tracking-wide border-b px-3">
            Mis Plantillas Guardadas
          </div>
          {plantillas.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelect(p.contenido);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm text-gray-800 transition flex items-center gap-2 group"
            >
              <FileText size={13} className="text-indigo-400 shrink-0" />
              <span className="truncate">{p.titulo}</span>
            </button>
          ))}
          <div className="border-t p-2">
            <a href="/plantillas" className="block text-xs text-center text-indigo-600 hover:underline py-1">
              Administrar plantillas →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal: CRUD ───────────────────────────────────────────────
export default function GestorPlantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [editando, setEditando] = useState<Plantilla | null>(null);
  const [creando, setCreando] = useState(false);

  // Estado del formulario
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');

  const reload = useCallback(() => setPlantillas(getPlantillas()), []);

  useEffect(() => {
    reload();
  }, [reload]);

  const abrirNueva = () => {
    setEditando(null);
    setTitulo('');
    setContenido('');
    setCreando(true);
  };

  const abrirEdicion = (p: Plantilla) => {
    setCreando(false);
    setTitulo(p.titulo);
    setContenido(p.contenido);
    setEditando(p);
  };

  const cancelar = () => {
    setCreando(false);
    setEditando(null);
    setTitulo('');
    setContenido('');
  };

  const guardar = () => {
    if (!titulo.trim() || !contenido.trim()) return;
    const lista = getPlantillas();

    if (editando) {
      // Actualizar existente
      const actualizada = lista.map((p) =>
        p.id === editando.id ? { ...p, titulo, contenido } : p
      );
      savePlantillas(actualizada);
    } else {
      // Crear nueva
      const nueva: Plantilla = {
        id: `pl_${Date.now()}`,
        titulo,
        contenido,
        creadaEl: new Date().toISOString(),
      };
      savePlantillas([...lista, nueva]);
    }

    cancelar();
    reload();
  };

  const eliminar = (id: string) => {
    if (!confirm('¿Eliminar esta plantilla? Esta acción no se puede deshacer.')) return;
    const filtradas = getPlantillas().filter((p) => p.id !== id);
    savePlantillas(filtradas);
    reload();
  };

  const formularioActivo = creando || !!editando;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Mis Plantillas de Garantía</h2>
          <p className="text-sm text-gray-500 mt-0.5">Crea modelos reutilizables para agilizar tus comprobantes.</p>
        </div>
        {!formularioActivo && (
          <button
            onClick={abrirNueva}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={16} /> Nueva Plantilla
          </button>
        )}
      </div>

      {/* Formulario creación / edición */}
      {formularioActivo && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-indigo-800">
            {editando ? `Editando: "${editando.titulo}"` : 'Nueva Plantilla'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Plantilla</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder='Ej: "Garantía estándar 12 meses"'
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido <span className="text-gray-400 font-normal">(puedes usar {`{{nombre_cliente}}`} y {`{{numero_serie}}`})</span>
            </label>
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
              <EditorPlantilla
                key={editando?.id ?? 'nueva'}
                initialValue={contenido}
                onChange={setContenido}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={guardar}
              disabled={!titulo.trim() || !contenido.trim()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-40"
            >
              <Check size={16} /> Guardar Plantilla
            </button>
            <button
              onClick={cancelar}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de plantillas */}
      {plantillas.length === 0 && !formularioActivo ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aún no tienes plantillas guardadas.</p>
          <button onClick={abrirNueva} className="mt-3 text-indigo-600 text-sm hover:underline">
            Crea tu primera plantilla →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plantillas.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={18} className="text-indigo-400 shrink-0" />
                  <h3 className="font-semibold text-gray-800 truncate">{p.titulo}</h3>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => abrirEdicion(p)}
                    title="Editar"
                    className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-500 transition"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => eliminar(p.id)}
                    title="Eliminar"
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div
                className="mt-3 text-xs text-gray-500 line-clamp-3 prose prose-xs max-w-none"
                dangerouslySetInnerHTML={{ __html: p.contenido }}
              />

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(p.creadaEl).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => abrirEdicion(p)}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Editar →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
