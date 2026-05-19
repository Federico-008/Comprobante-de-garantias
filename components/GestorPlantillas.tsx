"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Pencil, Trash2, Check, X, FileText, ChevronDown, Layout, Clock, ExternalLink } from 'lucide-react';

const EditorPlantilla = dynamic(() => import('@/components/EditorPlantilla'), { ssr: false });

export interface Plantilla {
  id: string;
  titulo: string;
  contenido: string;
  creadaEl: string;
}

const STORAGE_KEY = 'garantias_plantillas_v1';

const getPlantillas = (): Plantilla[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const savePlantillas = (items: Plantilla[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

interface SelectorProps {
  onSelect: (contenido: string) => void;
}

export function SelectorPlantilla({ onSelect }: SelectorProps) {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPlantillas(getPlantillas());
  }, [open]);

  if (plantillas.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] bg-obsidian-50 dark:bg-white/5 text-obsidian-600 dark:text-obsidian-300 border border-border/50 px-4 py-2 rounded-xl transition-all hover:bg-obsidian-100 dark:hover:bg-white/10"
      >
        <Layout size={12} className="text-sapphire-500" /> Cargar Plantilla <ChevronDown size={12} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-3 right-0 min-w-[280px] bg-white dark:bg-obsidian-950 border border-border/50 rounded-2xl shadow-float overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 text-[9px] text-obsidian-400 font-bold uppercase tracking-[0.2em] border-b border-border/30 bg-obsidian-50/30 dark:bg-white/5">
            Modelos de Respuesta
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {plantillas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelect(p.contenido);
                  setOpen(false);
                }}
                className="w-full text-left px-5 py-4 hover:bg-obsidian-50 dark:hover:bg-white/5 text-xs text-obsidian-700 dark:text-obsidian-200 transition flex items-center gap-4 border-b border-border/30 last:border-0"
              >
                <div className="bg-obsidian-100 dark:bg-white/5 p-2 rounded-lg">
                  <FileText size={14} className="text-obsidian-400" />
                </div>
                <span className="truncate font-semibold">{p.titulo}</span>
              </button>
            ))}
          </div>
          <div className="p-3 bg-obsidian-50/50 dark:bg-black/20">
            <a href="/plantillas" className="flex items-center justify-center gap-2 text-[9px] text-sapphire-600 dark:text-sapphire-400 hover:opacity-80 font-bold uppercase tracking-[0.2em] py-2 transition-all">
              Gestionar biblioteca <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GestorPlantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [editando, setEditando] = useState<Plantilla | null>(null);
  const [creando, setCreando] = useState(false);

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
      const actualizada = lista.map((p) =>
        p.id === editando.id ? { ...p, titulo, contenido } : p
      );
      savePlantillas(actualizada);
    } else {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-border/50">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Biblioteca de Modelos</h2>
          <p className="text-sm text-obsidian-500 dark:text-obsidian-400 font-medium mt-1">
            Crea estructuras reutilizables para agilizar el trabajo diario.
          </p>
        </div>
        {!formularioActivo && (
          <button
            onClick={abrirNueva}
            className="flex items-center justify-center gap-2 bg-foreground text-background dark:bg-white dark:text-obsidian-950 px-6 py-3 rounded-2xl text-xs font-bold transition-all hover:opacity-90 shadow-float active:scale-95"
          >
            <Plus size={16} /> Nueva Plantilla
          </button>
        )}
      </div>

      {/* Form */}
      {formularioActivo && (
        <div className="bg-obsidian-50/30 dark:bg-white/5 border border-border/50 rounded-3xl p-8 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-3">
             <div className="bg-sapphire-500/10 p-2 rounded-xl">
               <Pencil size={16} className="text-sapphire-500" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-widest text-obsidian-500 dark:text-obsidian-300">
              {editando ? `Editando: ${editando.titulo}` : 'Nueva Plantilla'}
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-obsidian-400 uppercase tracking-widest ml-1">Nombre descriptivo</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder='Ej. Garantía Apple iPhone'
              className="w-full bg-white dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-obsidian-400 uppercase tracking-widest ml-1">Cuerpo del documento</label>
            <div className="rounded-2xl overflow-hidden border border-border/50 bg-white dark:bg-black">
              <EditorPlantilla
                key={editando?.id ?? 'nueva'}
                initialValue={contenido}
                onChange={setContenido}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/30">
            <button
              onClick={guardar}
              disabled={!titulo.trim() || !contenido.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-sapphire-600 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 shadow-float border border-sapphire-500"
            >
              <Check size={18} /> Guardar Cambios
            </button>
            <button
              onClick={cancelar}
              className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-border/50 text-obsidian-600 dark:text-obsidian-300 px-8 py-4 rounded-2xl text-sm font-bold hover:bg-obsidian-50 dark:hover:bg-white/10 transition-all"
            >
              <X size={18} /> Cancelar edición
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {plantillas.length === 0 && !formularioActivo ? (
        <div className="text-center py-24 bg-obsidian-50/20 dark:bg-white/5 border border-dashed border-border/50 rounded-3xl group">
          <div className="bg-obsidian-100/50 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <FileText size={32} className="text-obsidian-200 dark:text-obsidian-600" />
          </div>
          <p className="text-base text-obsidian-500 dark:text-obsidian-400 font-semibold">Tu biblioteca está vacía.</p>
          <button onClick={abrirNueva} className="mt-4 text-xs font-bold uppercase tracking-widest text-sapphire-600 dark:text-sapphire-400 hover:opacity-80 transition-opacity">
            Crear la primera plantilla ahora →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plantillas.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-obsidian-950/40 border border-border/50 rounded-3xl p-8 hover:shadow-float hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 bg-obsidian-50 dark:bg-white/5 rounded-2xl border border-border/30">
                    <FileText size={18} className="text-sapphire-500" />
                  </div>
                  <h3 className="font-bold text-base truncate text-foreground">{p.titulo}</h3>
                </div>
                <div className="flex gap-1 shrink-0 lg:opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => abrirEdicion(p)}
                    className="p-2.5 rounded-xl hover:bg-sapphire-50 dark:hover:bg-sapphire-500/10 text-obsidian-400 hover:text-sapphire-600 transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => eliminar(p.id)}
                    className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-obsidian-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div
                className="mt-6 text-sm text-obsidian-500 dark:text-obsidian-400 line-clamp-3 prose prose-sm dark:prose-invert opacity-70 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: p.contenido }}
              />

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/30">
                <div className="flex items-center gap-2 text-[10px] font-bold text-obsidian-300 uppercase tracking-widest">
                  <Clock size={12} /> {new Date(p.creadaEl).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <button
                  onClick={() => abrirEdicion(p)}
                  className="text-[10px] font-bold uppercase tracking-widest text-sapphire-600 dark:text-sapphire-400 hover:opacity-70 transition-all"
                >
                  Editar plantilla →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
