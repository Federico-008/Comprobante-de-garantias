"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { storage } from '@/lib/storage';
import type { Comprobante, PerfilNegocio } from '@/types';
import ComprobantePDF from '@/components/ComprobantePDF';
import Link from 'next/link';

export default function PublicWarrantyView() {
  const { id } = useParams();
  const [garantia, setGarantia] = useState<Comprobante | null>(null);
  const [perfil, setPerfil] = useState<PerfilNegocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    try {
      // buscamos la garantia
      const { data: garantiaData, error: gError } = await supabase
        .from('garantias_emitidas')
        .select('*')
        .eq('id', id)
        .single();

      if (gError || !garantiaData) throw new Error("Garantía no encontrada");

      setGarantia(garantiaData);

      const p = storage.getPerfil();
      if (!p.configurado) throw new Error("Negocio no configurado");
      setPerfil(p);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-3xl p-8 text-center max-w-sm">
        <p className="text-red-600 dark:text-red-400 font-bold text-lg">Comprobante no encontrado</p>
        <p className="text-obsidian-500 text-sm mt-2">El documento no existe o ha sido eliminado.</p>
      </div>
    </div>
  );

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
              plantillaTexto={garantia.tipo === 'recepcion' ? (perfil.plantillaRecepcionHtml || '') : (perfil.plantillaHtml || '')}
            />
          </div>
        </div>

        <footer className="text-center text-xs text-obsidian-400 py-6 font-medium">
          Este documento es una representación digital válida almacenada localmente. Consérvelo para cualquier consulta futura.
        </footer>
      </div>
    </div>
  );
}
