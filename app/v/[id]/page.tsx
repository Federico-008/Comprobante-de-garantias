"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase, GarantiaEmitida, PerfilNegocio } from '@/lib/supabase';
import ComprobantePDF from '@/components/ComprobantePDF';

export default function PublicWarrantyView() {
  const { id } = useParams();
  const [garantia, setGarantia] = useState<GarantiaEmitida | null>(null);
  const [perfil, setPerfil] = useState<PerfilNegocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setVerificationError(null);

      // buscamos la garantia
      const { data: garantiaData, error: gError } = await supabase
        .from('garantias_emitidas')
        .select('*')
        .eq('id', id)
        .single();

      if (gError || !garantiaData) throw new Error("Garantía no encontrada");

      setGarantia(garantiaData);

      // buscamos el perfil del negocio
      const { data: perfilData, error: pError } = await supabase
        .from('perfiles_negocio')
        .select('*')
        .eq('id', garantiaData.perfil_id)
        .single();

      if (pError || !perfilData) throw new Error("Negocio no encontrado");

      setPerfil(perfilData);
    } catch (err) {
      console.error(err);
      setVerificationError(
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo verificar este comprobante en este momento.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-sapphire-500/20 border-t-sapphire-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!garantia || !perfil) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-3xl p-8 text-center max-w-md shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 mb-4">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" />
            <path d="M12 16h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <p className="text-amber-700 dark:text-amber-300 font-bold text-lg">No se pudo verificar este comprobante</p>
        <p className="text-obsidian-500 dark:text-obsidian-400 text-sm mt-2">
          {verificationError || 'No fue posible validar la autenticidad de este comprobante en este momento.'}
        </p>
        <p className="text-obsidian-400 dark:text-obsidian-500 text-xs mt-4">
          Si el comprobante fue emitido correctamente, este enlace debería mostrar su verificación oficial.
        </p>
      </div>
    </div>
  );

  // aca empieza la vista publica
  return (
    <div className="min-h-screen bg-background py-10 px-4 md:px-8 flex flex-col items-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-sapphire-100/30 dark:from-sapphire-900/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-sapphire-50 dark:bg-sapphire-500/10 text-sapphire-600 dark:text-sapphire-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-sapphire-200/50 dark:border-sapphire-500/20">
            Documento Oficial Verificado
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {garantia.tipo === 'recepcion' ? 'Orden de Servicio Digital' : 'Comprobante de Garantía Digital'}
          </h1>
          <p className="text-obsidian-500 dark:text-obsidian-400 font-medium">
            Emitido por <span className="font-bold text-foreground">{perfil.nombre}</span>
          </p>
        </div>

        {/* PDF Card */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-3 md:p-6 flex justify-center bg-obsidian-50/50 dark:bg-black/20">
            <ComprobantePDF
              negocio={perfil}
              garantia={garantia}
              plantillaTexto={garantia.tipo === 'recepcion' ? (perfil.plantilla_recepcion_html || '') : (perfil.plantilla_html || '')}
            />
          </div>
        </div>

        <footer className="text-center text-xs text-obsidian-400 py-6 font-medium">
          Este documento es una representación digital válida. Consérvelo para cualquier consulta futura.
        </footer>
      </div>
    </div>
  );
}
