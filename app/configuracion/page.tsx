"use client";

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { extractDominantColor } from '@/lib/color-extractor';
import type { PerfilNegocio } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Loader2, Store, MapPin, Phone, Palette, 
  Info, AlertTriangle, Image as ImageIcon, FileText,
  Instagram, Facebook, MessageSquare, Download, Upload, Share2, Trash2
} from 'lucide-react';
import EditorPlantilla from '@/components/EditorPlantilla';

export default function ConfiguracionPage() {
  const [perfil, setPerfil] = useState<PerfilNegocio | null>(null);
  const [nombre, setNombre] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [plantillaHtml, setPlantillaHtml] = useState('');
  const [plantillaRecepcionHtml, setPlantillaRecepcionHtml] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [mensajeWs, setMensajeWs] = useState('');
  const [colorPrimario, setColorPrimario] = useState('#2563eb');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const p = storage.getPerfil();
    if (!p.configurado) {
      router.push('/dashboard');
      return;
    }
    
    setPerfil(p);
    setNombre(p.nombre || '');
    setLogoDataUrl(p.logoDataUrl || null);
    setPlantillaHtml(p.plantillaHtml || '');
    setPlantillaRecepcionHtml(p.plantillaRecepcionHtml || '');
    setDireccion(p.direccion || '');
    setTelefono(p.telefono || '');
    setColorPrimario(p.colorPrimario || '#2563eb');
    setInstagram(p.instagram || '');
    setFacebook(p.facebook || '');
    setMensajeWs(p.whatsappMessage || '');
    setLoading(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setLogoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractColor = async () => {
    if (!logoDataUrl) return;
    setExtracting(true);
    const color = await extractDominantColor(logoDataUrl);
    if (color) {
      setColorPrimario(color);
    }
    setExtracting(false);
  };

  const exportData = () => {
    try {
      const p = storage.getPerfil();
      const c = storage.getComprobantes();
      const data = { perfil: p, comprobantes: c };
      
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `GarantiaPro_Backup_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Error al exportar datos.");
    }
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const data = JSON.parse(jsonStr);
        if (data.perfil && data.comprobantes) {
          storage.savePerfil(data.perfil);
          // Restore comprobantes by clearing and saving
          localStorage.setItem('garantias_comprobantes_v1', JSON.stringify(data.comprobantes));
          window.location.reload();
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      } catch (err) {
        console.error(err);
        alert("Error al importar datos.");
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) return;
    
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      storage.savePerfil({
        nombre,
        logoDataUrl,
        plantillaHtml,
        plantillaRecepcionHtml,
        direccion,
        telefono,
        colorPrimario,
        instagram,
        facebook,
        whatsappMessage: mensajeWs
      });
      
      setMessage({ text: 'Configuracion guardada exitosamente.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMessage({ text: 'Error: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = () => {
    const confirmation = prompt('RESET TOTAL: Se eliminarán TODOS tus datos y comprobantes locales.\nEscribe "RESETEAR" para confirmar:');
    if (confirmation !== 'RESETEAR') return;

    storage.clear();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-sapphire-500/10 border-t-sapphire-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-20 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <header className="py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 mb-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-3 bg-white dark:bg-white/5 hover:bg-obsidian-50 dark:hover:bg-white/10 rounded-2xl transition-all border border-border/50 shadow-sm">
              <ArrowLeft size={20} className="text-obsidian-600 dark:text-obsidian-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
              <p className="text-sm text-obsidian-500 dark:text-obsidian-400 font-medium mt-1">Personaliza tu experiencia y marca profesional.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-5 py-2.5 bg-obsidian-100 text-obsidian-900 dark:bg-white/10 dark:text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer">
              <Upload size={16} /> Importar
              <input type="file" accept=".json" className="hidden" onChange={importData} />
            </label>
            <button 
              onClick={exportData}
              className="flex items-center gap-2 px-5 py-2.5 bg-obsidian-900 text-white dark:bg-white dark:text-obsidian-950 rounded-2xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-float"
            >
              <Download size={16} /> Exportar
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSave} className="space-y-8">
              {message.text && (
                <div className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                }`}>
                  <Info size={14} /> {message.text}
                </div>
              )}

              <section className="glass-card p-8 rounded-[2rem] space-y-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sapphire-600 dark:text-sapphire-400 flex items-center gap-2">
                  <Store size={14} /> Informacion General
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <input
                      type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin size={12} /> Direccion Fisica</label>
                    <input
                      type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)}
                      className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={12} /> Telefono de Contacto</label>
                    <input
                      type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                      className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              <section className="glass-card p-8 rounded-[2rem] space-y-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sapphire-600 dark:text-sapphire-400 flex items-center gap-2">
                  <Share2 size={14} /> Presencia Digital
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Instagram size={12} /> Usuario Instagram</label>
                    <input
                      type="text" placeholder="@usuario" value={instagram} onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Facebook size={12} /> Pagina Facebook</label>
                    <input
                      type="text" placeholder="facebook.com/pagina" value={facebook} onChange={(e) => setFacebook(e.target.value)}
                      className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MessageSquare size={12} /> Plantilla de WhatsApp</label>
                    <textarea 
                      rows={3} value={mensajeWs} onChange={(e) => setMensajeWs(e.target.value)}
                      className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all resize-none"
                    />
                    <p className="text-[10px] text-obsidian-400 mt-1">Usa <code className="bg-obsidian-100 dark:bg-white/5 px-1 rounded">{"{{nombre_cliente}}"}</code> y <code className="bg-obsidian-100 dark:bg-white/5 px-1 rounded">{"{{link_comprobante}}"}</code> para datos dinamicos.</p>
                  </div>
                </div>
              </section>

              <section className="glass-card p-8 rounded-[2rem] space-y-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sapphire-600 dark:text-sapphire-400 flex items-center gap-2">
                  <FileText size={14} /> Textos Legales
                </h2>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest ml-1">Terminos de Recepcion</label>
                    <div className="rounded-2xl overflow-hidden border border-border/50 shadow-inner-soft">
                      <EditorPlantilla initialValue={plantillaRecepcionHtml} onChange={setPlantillaRecepcionHtml} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest ml-1">Terminos de Entrega y Garantia</label>
                    <div className="rounded-2xl overflow-hidden border border-border/50 shadow-inner-soft">
                      <EditorPlantilla initialValue={plantillaHtml} onChange={setPlantillaHtml} />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-between pt-6">
                <button
                  type="submit" disabled={saving}
                  className="bg-obsidian-950 text-white dark:bg-white dark:text-obsidian-950 font-bold text-xs uppercase tracking-widest py-5 px-12 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 shadow-float"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {saving ? 'Guardando...' : 'Aplicar Cambios'}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] sticky top-8 space-y-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-obsidian-400">Vista de Marca</h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Identidad (Logo)</label>
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-dashed border-obsidian-200 dark:border-white/20 rounded-2xl py-10 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden">
                      {logoDataUrl ? (
                        <img src={logoDataUrl} alt="Logo" className="max-h-16 w-auto object-contain z-0" />
                      ) : (
                        <>
                          <ImageIcon size={24} className="text-obsidian-300" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian-400">Cambiar Logo</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {logoDataUrl && (
                    <button 
                      onClick={handleExtractColor}
                      disabled={extracting}
                      className="w-full mt-2 py-2 text-[10px] font-bold uppercase tracking-widest text-sapphire-600 bg-sapphire-50 dark:bg-sapphire-500/10 rounded-xl hover:bg-sapphire-100 transition-colors flex justify-center items-center gap-2"
                    >
                      {extracting ? <Loader2 className="animate-spin" size={12} /> : <Palette size={12} />}
                      Extraer Color del Logo
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Firma Visual (Color)</label>
                  <div className="flex items-center gap-4 p-4 bg-obsidian-50/50 dark:bg-white/5 rounded-2xl border border-border/50">
                    <input type="color" value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} className="h-10 w-16 rounded-xl cursor-pointer bg-transparent border-0" />
                    <span className="text-xs font-mono font-bold tracking-widest text-obsidian-500 uppercase">{colorPrimario}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 space-y-4">
                  <p className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest">Previsualizacion del Cabezal</p>
                  <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm flex justify-between items-end min-h-[120px]">
                    <div className="max-w-[60%]">
                      {logoDataUrl ? (
                        <img src={logoDataUrl} alt="Preview" className="max-h-12 w-auto object-contain" />
                      ) : (
                        <h4 className="text-lg font-black uppercase text-black leading-tight">{nombre || 'Mi Negocio'}</h4>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="w-8 h-8 rounded-lg mb-2 ml-auto" style={{ backgroundColor: colorPrimario }}></div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Documento Oficial</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-500/5 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/10">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} /> Zona de Riesgo
                </h4>
                <p className="text-[11px] text-amber-800/60 dark:text-amber-400/60 leading-relaxed font-medium mb-4">
                  Al resetear los datos, todos tus comprobantes locales y configuración se perderan permanentemente.
                </p>
                <button
                  type="button" onClick={handleResetData}
                  className="w-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/80 transition-colors flex justify-center items-center gap-2"
                >
                  <Trash2 size={12} /> Resetear Datos Locales
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
