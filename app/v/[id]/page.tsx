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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
      Cargando comprobante oficial...
    </div>
  );

  if (!garantia || !perfil) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">
      El comprobante no existe o ha expirado.
    </div>
  );

  // aca empieza la vista publica
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">Comprobante de Garantía Digital</h1>
          <p className="text-gray-500">Documento oficial emitido por <span className="font-bold text-gray-700">{perfil.nombre}</span></p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-2 md:p-6 overflow-x-auto flex justify-center bg-gray-200">
            {/* Reutilizamos el componente de PDF pero en modo visualización */}
            <ComprobantePDF 
              negocio={perfil}
              garantia={garantia}
              plantillaTexto={perfil.plantilla_html || ''}
            />
          </div>
        </div>

        <footer className="text-center text-xs text-gray-400 py-8">
          Este documento es una representación digital válida de su garantía. 
          Consérvelo para cualquier reclamo futuro.
        </footer>
      </div>
    </div>
  );
}
