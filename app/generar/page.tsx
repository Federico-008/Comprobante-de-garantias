"use client";

import React, { useState, useEffect } from 'react';
import EditorPlantilla from '@/components/EditorPlantilla';
import ComprobantePDF from '@/components/ComprobantePDF';
import { storage } from '@/lib/storage';
import type { PerfilNegocio, Comprobante } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { SelectorPlantilla } from '@/components/GestorPlantillas';
import { v4 as uuidv4 } from 'uuid';

export default function GeneradorGarantia() {
  const [perfil, setPerfil] = useState<PerfilNegocio | null>(null);
  const [plantilla, setPlantilla] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [modeloDispositivo, setModeloDispositivo] = useState('');
  const [cfNumber, setCfNumber] = useState('...');
  const [vencimientoDias, setVencimientoDias] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [isOverflow, setIsOverflow] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState<'recepcion' | 'entrega'>('recepcion');
  const [estadoEstetico, setEstadoEstetico] = useState('');
  const [fallaReportada, setFallaReportada] = useState('');
  const [accesorios, setAccesorios] = useState('');
  const [presupuestoEstimado, setPresupuestoEstimado] = useState('');
  const [trabajoRealizado, setTrabajoRealizado] = useState('');
  
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    initRealData();
  }, []);

  const initRealData = () => {
    const p = storage.getPerfil();
    if (!p.configurado) {
      router.push('/dashboard');
      return;
    }
    
    setPerfil(p);
    setPlantilla(p.plantillaRecepcionHtml || '<p>Redacta tus términos aquí...</p>');
    
    const nextCF = storage.getNextCfNumber();
    setCfNumber(nextCF);
    setNumeroSerie(nextCF);
    setIsLoading(false);
  };

  useEffect(() => {
    if (perfil && !shareUrl) {
        if (tipoDocumento === 'recepcion') {
            setPlantilla(perfil.plantillaRecepcionHtml || '<p>Redacta tus términos de recepción aquí...</p>');
        } else {
            setPlantilla(perfil.plantillaHtml || '<p>Redacta tus términos de garantía aquí...</p>');
        }
    }
  }, [tipoDocumento, perfil]);

  const handleSaveToDB = () => {
    if (!perfil) return;
    try {
      setShareUrl(null);
      
      const newId = uuidv4();
      const comprobante: Comprobante = {
        id: newId,
        cfNumber,
        clienteData: { nombre: nombreCliente, telefono: telefonoCliente },
        productoData: { 
          numeroSerie, 
          modelo: modeloDispositivo,
          estadoEstetico,
          fallaReportada,
          accesorios,
          presupuestoEstimado,
          trabajoRealizado
        },
        fechaVencimiento: getFechaVencimientoISO(),
        tipo: tipoDocumento,
        createdAt: new Date().toISOString()
      };
      
      storage.saveComprobante(comprobante);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setShareUrl(`${baseUrl}/v/${newId}`);

      const updateData = tipoDocumento === 'recepcion' 
        ? { plantillaRecepcionHtml: plantilla }
        : { plantillaHtml: plantilla };

      storage.savePerfil(updateData);
      
      setTimeout(() => {
        const nextCF = storage.getNextCfNumber();
        setCfNumber(nextCF);
        setNumeroSerie(nextCF);
      }, 2000);

    } catch (err) {
      console.error("Error al guardar comprobante", err);
    }
  };

  const getFechaVencimientoISO = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + vencimientoDias);
    return fecha.toISOString();
  };

  if (isLoading || !perfil) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
      <div className="w-6 h-6 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
    </div>;
  }

  const garantiaActual: Comprobante = {
    id: "temp",
    cfNumber: cfNumber,
    clienteData: { nombre: nombreCliente, telefono: telefonoCliente },
    productoData: { 
      numeroSerie, 
      modelo: modeloDispositivo,
      estadoEstetico,
      fallaReportada,
      accesorios,
      presupuestoEstimado,
      trabajoRealizado
    },
    fechaVencimiento: getFechaVencimientoISO(),
    tipo: tipoDocumento,
    createdAt: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <header className="py-10 flex items-center justify-between border-b border-border/50 mb-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2.5 bg-obsidian-50 dark:bg-white/5 hover:bg-obsidian-100 dark:hover:bg-white/10 rounded-2xl transition-colors border border-border/50">
              <ArrowLeft size={20} className="text-obsidian-500 dark:text-obsidian-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nueva Operación</h1>
              <p className="text-sm text-obsidian-500 font-medium mt-1">Configura y emite un comprobante digital impecable.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-sapphire-600 text-white rounded-2xl text-sm font-bold shadow-float border border-sapphire-500">
            <span className="opacity-70 font-normal mr-1">CF -</span> {cfNumber}
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <section className="glass-card p-8 rounded-3xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold flex items-center gap-3 tracking-tight">
                  <div className="bg-sapphire-50 dark:bg-sapphire-500/10 p-2 rounded-xl">
                    <FileText size={20} className="text-sapphire-600 dark:text-sapphire-400" />
                  </div>
                  Información General
                </h2>
                <div className="flex bg-obsidian-50 dark:bg-white/5 p-1.5 rounded-2xl border border-border/50">
                  <button
                    onClick={() => setTipoDocumento('recepcion')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                      tipoDocumento === 'recepcion' 
                        ? 'bg-white dark:bg-obsidian-800 text-foreground shadow-sm' 
                        : 'text-obsidian-400 hover:text-foreground'
                    }`}
                  >
                    Recepción
                  </button>
                  <button
                    onClick={() => setTipoDocumento('entrega')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                      tipoDocumento === 'entrega' 
                        ? 'bg-white dark:bg-obsidian-800 text-foreground shadow-sm' 
                        : 'text-obsidian-400 hover:text-foreground'
                    }`}
                  >
                    Entrega
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Nombre del Cliente</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Juan Pérez"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Teléfono (WhatsApp)</label>
                  <input 
                    type="tel" 
                    placeholder="Ej. 54911..."
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                    className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Modelo / Equipo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. MacBook Air M2"
                    value={modeloDispositivo}
                    onChange={(e) => setModeloDispositivo(e.target.value)}
                    className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Nº de Serie / Control</label>
                  <input 
                    type="text" 
                    value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-5">
                {tipoDocumento === 'recepcion' ? (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Falla Reportada</label>
                      <input 
                        type="text" 
                        placeholder="Describa el problema..."
                        value={fallaReportada}
                        onChange={(e) => setFallaReportada(e.target.value)}
                        className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Estado Estético</label>
                      <input 
                        type="text" 
                        placeholder="Rayas, golpes, etc."
                        value={estadoEstetico}
                        onChange={(e) => setEstadoEstetico(e.target.value)}
                        className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Presupuesto Estimado</label>
                      <input 
                        type="text" 
                        placeholder="Ej. $10.000"
                        value={presupuestoEstimado}
                        onChange={(e) => setPresupuestoEstimado(e.target.value)}
                        className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Trabajo Realizado</label>
                      <input 
                        type="text" 
                        placeholder="Reparaciones efectuadas..."
                        value={trabajoRealizado}
                        onChange={(e) => setTrabajoRealizado(e.target.value)}
                        className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Días de Cobertura</label>
                      <input 
                        type="number" 
                        value={vencimientoDias || ''}
                        onChange={(e) => setVencimientoDias(parseInt(e.target.value) || 0)}
                        className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 focus:border-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="glass-card p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Términos y Condiciones</h2>
                <SelectorPlantilla onSelect={(contenido) => setPlantilla(contenido)} />
              </div>
              <div className="bg-white rounded-2xl overflow-hidden border border-border/50">
                <EditorPlantilla 
                  initialValue={plantilla}
                  onChange={setPlantilla}
                  disabled={isOverflow}
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-3xl sticky top-28">
              <h2 className="text-xl font-bold mb-6 tracking-tight">Previsualización A4</h2>
              <div className="bg-obsidian-50/50 dark:bg-black/20 rounded-2xl border border-border/50 p-4 overflow-hidden relative group">
                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
                <ComprobantePDF 
                  negocio={{...perfil, plantillaHtml: plantilla} as PerfilNegocio}
                  garantia={garantiaActual}
                  plantillaTexto={plantilla}
                  onSave={handleSaveToDB}
                  onOverflowChange={setIsOverflow}
                  shareUrl={shareUrl}
                />
              </div>

              {shareUrl && (
                <div className="mt-8 p-5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-fade-in shadow-soft">
                  <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-xl">
                    <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">¡Documento Generado!</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Listo para compartir o imprimir.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
