"use client";

import React, { useState, useEffect } from 'react';
import EditorPlantilla from '@/components/EditorPlantilla';
import ComprobantePDF from '@/components/ComprobantePDF';
import { supabase } from '@/lib/supabase';
import type { PerfilNegocio, GarantiaEmitida } from '@/lib/supabase';
import { getNextCFNumber } from '@/lib/generatorCF';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { SelectorPlantilla } from '@/components/GestorPlantillas';

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

  const initRealData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // aca se cargan los datos iniciales
      const { data: perfiles } = await supabase
        .from('perfiles_negocio')
        .select('*')
        .eq('id', session.user.id);
        
      if (perfiles && perfiles.length > 0) {
        setPerfil(perfiles[0]);
        setPerfil(perfiles[0]);
        setPlantilla(perfiles[0].plantilla_recepcion_html || '<p>Redacta tus términos aquí...</p>');
        
        // Buscar el CF number en base a este negocio
        const nextCF = await getNextCFNumber(perfiles[0].id);
        setCfNumber(nextCF);
        setNumeroSerie(nextCF); // El serial es el número de comprobante
      } else {
        alert("No se encontró perfil de negocio para este usuario.");
        router.push('/login');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (perfil && !shareUrl) { // Solo cambiar si no hemos guardado (para evitar que se sobreescriba al recargar)
        if (tipoDocumento === 'recepcion') {
            setPlantilla(perfil.plantilla_recepcion_html || '<p>Redacta tus términos de recepción aquí...</p>');
        } else {
            setPlantilla(perfil.plantilla_html || '<p>Redacta tus términos de garantía aquí...</p>');
        }
    }
  }, [tipoDocumento, perfil]);

  const handleSaveToDB = async () => {
    if (!perfil) return;
    try {
      setShareUrl(null);
      // se guarda en la base
      const { data, error: errorGarantia } = await supabase.from('garantias_emitidas').insert({
        cf_number: cfNumber,
        cliente_data: { nombre: nombreCliente, telefono: telefonoCliente },
        producto_data: { 
          numero_serie: numeroSerie, 
          modelo: modeloDispositivo,
          estado_estetico: estadoEstetico,
          falla_reportada: fallaReportada,
          accesorios: accesorios,
          presupuesto_estimado: presupuestoEstimado,
          trabajo_realizado: trabajoRealizado
        },
        fecha_vencimiento: getFechaVencimientoISO(),
        perfil_id: perfil.id,
        tipo: tipoDocumento
      }).select().single();
      
      if (errorGarantia) throw errorGarantia;

      // link publico
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/v/${data.id}`);

      // se guarda la plantilla actual dependiendo del tipo
      const updateData = tipoDocumento === 'recepcion' 
        ? { plantilla_recepcion_html: plantilla }
        : { plantilla_html: plantilla };

      await supabase
        .from('perfiles_negocio')
        .update(updateData)
        .eq('id', perfil.id);
      
      setTimeout(async () => {
        const nextCF = await getNextCFNumber(perfil.id);
        setCfNumber(nextCF);
        setNumeroSerie(nextCF);
      }, 2000);

    } catch (err) {
      console.error("Error al guardar en Supabase", err);
      throw err; 
    }
  };

  const getFechaVencimientoISO = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + vencimientoDias);
    return fecha.toISOString();
  };

  if (isLoading || !perfil) {
    return <div className="min-h-screen flex items-center justify-center">Cargando aplicación...</div>;
  }

  const garantiaActual: GarantiaEmitida = {
    id: "temp",
    cf_number: cfNumber,
    cliente_data: { nombre: nombreCliente, telefono: telefonoCliente },
    producto_data: { 
      numero_serie: numeroSerie, 
      modelo: modeloDispositivo,
      estado_estetico: estadoEstetico,
      falla_reportada: fallaReportada,
      accesorios: accesorios,
      presupuesto_estimado: presupuestoEstimado,
      trabajo_realizado: trabajoRealizado
    },
    fecha_vencimiento: getFechaVencimientoISO(),
    perfil_id: perfil.id,
    tipo: tipoDocumento
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Emitir Comprobante</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* controles de la izquierda */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tipo de Trámite</h2>
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setTipoDocumento('recepcion')}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                      tipoDocumento === 'recepcion' 
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                    }`}
                  >
                    1. Recepción (OS)
                  </button>
                  <button
                    onClick={() => setTipoDocumento('entrega')}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                      tipoDocumento === 'entrega' 
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                        : 'text-gray-500 dark:text-slate-400 hover:text-primary'
                    }`}
                  >
                    2. Entrega (Garantía)
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nombre del Cliente ({`{{nombre_cliente}}`})</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Juan Pérez"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">WhatsApp del Cliente</label>
                  <input 
                    type="tel" 
                    placeholder="Ej: 54911..."
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 opacity-50">Número Serial (Automático)</label>
                    <input 
                      type="text" 
                      value={cfNumber}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 sm:text-sm p-2 border cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Modelo / Dispositivo</label>
                    <input 
                      type="text" 
                      placeholder="Ej: iPhone 13 Pro"
                      value={modeloDispositivo}
                      onChange={(e) => setModeloDispositivo(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Campos Condicionales según el Tipo */}
                {tipoDocumento === 'recepcion' ? (
                  <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Falla Reportada</label>
                      <input 
                        type="text" 
                        placeholder="Ej: No enciende, pantalla rota..."
                        value={fallaReportada}
                        onChange={(e) => setFallaReportada(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Estado Estético</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Pantalla rayada, golpe en esquina superior..."
                        value={estadoEstetico}
                        onChange={(e) => setEstadoEstetico(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Accesorios</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Funda, cargador..."
                          value={accesorios}
                          onChange={(e) => setAccesorios(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Presupuesto Estimado</label>
                        <input 
                          type="text" 
                          placeholder="Ej: $15.000 (A revisar)"
                          value={presupuestoEstimado}
                          onChange={(e) => setPresupuestoEstimado(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Trabajo Realizado</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Cambio de pantalla y batería"
                        value={trabajoRealizado}
                        onChange={(e) => setTrabajoRealizado(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Días de Cobertura</label>
                      <input 
                        type="number" 
                        placeholder="Ej: 90"
                        value={vencimientoDias || ''}
                        onChange={(e) => setVencimientoDias(parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2 mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plantilla del Comprobante</h2>
                <SelectorPlantilla onSelect={(contenido) => setPlantilla(contenido)} />
              </div>
              <div className="dark:bg-white rounded-md overflow-hidden">
                <EditorPlantilla 
                  initialValue={plantilla}
                  onChange={setPlantilla}
                  disabled={isOverflow}
                />
              </div>
            </div>
          </div>

          {/* vista previa y pdf */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 border-b dark:border-slate-800 pb-2 flex justify-between items-center text-gray-900 dark:text-white">
              <span>Vista Previa del PDF</span>
              <span className="text-sm bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded font-mono shadow-sm">
                Borrador: {cfNumber}
              </span>
            </h2>
            <div className="overflow-x-auto text-sm bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border dark:border-slate-800">
              <ComprobantePDF 
                negocio={{...perfil, plantilla_html: plantilla}}
                garantia={garantiaActual}
                plantillaTexto={plantilla}
                onSave={handleSaveToDB}
                onOverflowChange={setIsOverflow}
                shareUrl={shareUrl}
              />
            </div>

            {shareUrl && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg animate-in fade-in duration-500">
                <p className="text-sm text-green-800 dark:text-green-400 font-medium text-center">✅ ¡Comprobante guardado! Usa los botones de arriba para compartir.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
