"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { PerfilNegocio } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Store, FileText } from 'lucide-react';
import EditorPlantilla from '@/components/EditorPlantilla';

export default function ConfiguracionPage() {
  const [perfil, setPerfil] = useState<PerfilNegocio | null>(null);
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [plantillaHtml, setPlantillaHtml] = useState('');
  const [plantillaRecepcionHtml, setPlantillaRecepcionHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('perfiles_negocio')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setPerfil(data);
        setNombre(data.nombre || '');
        setLogoUrl(data.logo_url || '');
        setPlantillaHtml(data.plantilla_html || '');
        setPlantillaRecepcionHtml(data.plantilla_recepcion_html || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) return;
    
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      let finalLogoUrl = logoUrl;

      // Si el usuario seleccionó un nuevo archivo desde su computadora
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${perfil.id}-${Date.now()}.${fileExt}`; // Nombre único
        
        // Subir a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true });
          
        if (uploadError) {
          console.error("Storage Error:", uploadError);
          throw new Error("STORAGE: " + uploadError.message);
        }
        
        // Obtener la URL pública del archivo recién subido
        const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
        finalLogoUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('perfiles_negocio')
        .update({
          nombre: nombre,
          logo_url: finalLogoUrl,
          plantilla_html: plantillaHtml,
          plantilla_recepcion_html: plantillaRecepcionHtml
        })
        .eq('id', perfil.id);

      if (error) {
        console.error("DB Error:", error);
        throw new Error("BASE DE DATOS: " + error.message);
      }
      
      setMessage({ text: '¡Perfil actualizado con éxito!', type: 'success' });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMessage({ text: 'Error al guardar: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando configuración...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Store className="text-primary" size={32} /> Configuración del Negocio
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <form onSubmit={handleSave} className="p-8 space-y-6">
            
            {message.text && (
              <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Nombre Público de tu Negocio</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Este nombre aparecerá en la parte superior izquierda de tus comprobantes.</p>
              <input 
                type="text" 
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-slate-700 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                placeholder="Ej. TechStore Inc."
              />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Subir Logotipo (Marca de Agua)</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
                Selecciona una imagen en formato PNG o JPG desde tu computadora. Se colocará en el centro de tu comprobante con baja opacidad.
              </p>
              <input 
                type="file" 
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    setLogoFile(file);
                    // Mostrar preview temporal
                    setLogoUrl(URL.createObjectURL(file)); 
                  }
                }}
                className="w-full text-gray-900 dark:text-white bg-white dark:bg-slate-800 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition"
              />
            </div>

            {logoUrl && (
              <div className="pt-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Vista previa de tu logo:</p>
                <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-center h-40 border border-gray-300 dark:border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Plantilla de Recepción (Orden de Servicio)</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Redacta aquí los términos que aparecerán al recibir un equipo (ej. Contrato de depósito).</p>
              <div className="dark:bg-white rounded-md overflow-hidden">
                <EditorPlantilla 
                  initialValue={plantillaRecepcionHtml} 
                  onChange={setPlantillaRecepcionHtml} 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Plantilla de Entrega (Garantía)</label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Redacta aquí los términos que aparecerán al entregar un equipo y emitir su garantía.</p>
              <div className="dark:bg-white rounded-md overflow-hidden">
                <EditorPlantilla 
                  initialValue={plantillaHtml} 
                  onChange={setPlantillaHtml} 
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
