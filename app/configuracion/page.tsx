"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { PerfilNegocio } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Loader2, Store, MapPin, Phone, Palette, 
  Info, Trash2, AlertTriangle, Image as ImageIcon, FileText,
  Instagram, Facebook, MessageSquare, Download, Share2
} from 'lucide-react';
import EditorPlantilla from '@/components/EditorPlantilla';

export default function ConfiguracionPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
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
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
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
        setDireccion(data.direccion || '');
        setTelefono(data.telefono || '');
        setColorPrimario(data.color_primario || '#2563eb');
        setInstagram(data.instagram_user || '');
        setFacebook(data.facebook_user || '');
        setMensajeWs(data.mensaje_whatsapp_predeterminado || 'Hola {{nombre_cliente}}, adjunto el comprobante de garantia de tu equipo: {{link_comprobante}}');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const { data: garantias } = await supabase
        .from('garantias_emitidas')
        .select('*')
        .order('created_at', { ascending: false });

      if (!garantias || garantias.length === 0) {
        alert("No hay datos para exportar.");
        return;
      }

      const headers = ["ID", "Fecha", "Cliente", "Equipo", "Vencimiento"];
      const rows = garantias.map(g => [
        g.cf_number,
        new Date(g.created_at).toLocaleDateString(),
        g.cliente_data?.nombre,
        g.producto_data?.modelo,
        g.fecha_vencimiento
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Garantias_Export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) return;
    
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      let finalLogoUrl = logoUrl;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${perfil.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true });
          
        if (uploadError) throw new Error("STORAGE: " + uploadError.message);
        
        const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
        finalLogoUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('perfiles_negocio')
        .update({
          nombre: nombre,
          logo_url: finalLogoUrl,
          plantilla_html: plantillaHtml,
          plantilla_recepcion_html: plantillaRecepcionHtml,
          direccion: direccion,
          telefono: telefono,
          color_primario: colorPrimario,
          instagram_user: instagram,
          facebook_user: facebook,
          mensaje_whatsapp_predeterminado: mensajeWs
        })
        .eq('id', perfil.id);

      if (error) throw new Error("BASE DE DATOS: " + error.message);
      
      setMessage({ text: 'Configuracion guardada exitosamente.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMessage({ text: 'Error: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('ELIMINAR CUENTA: Esta accion es irreversible.\nEscribe "ELIMINAR MI CUENTA" para confirmar:');
    if (confirmation !== 'ELIMINAR MI CUENTA') return;

    setIsDeletingAccount(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(perfil.id);
      if (error) throw error;
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err: any) {
      alert("Error al eliminar cuenta. Contacte a soporte.");
      setIsDeletingAccount(false);
    }
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
              <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
              <p className="text-sm text-obsidian-500 dark:text-obsidian-400 font-medium mt-1">Personaliza tu experiencia y marca profesional.</p>
            </div>
          </div>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 px-5 py-2.5 bg-obsidian-900 text-white dark:bg-white dark:text-obsidian-950 rounded-2xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-float"
          >
            <Download size={16} /> Exportar Datos
          </button>
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

                <button
                  type="button" onClick={handleDeleteAccount}
                  className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-2"
                >
                  <Trash2 size={12} /> Eliminar mi Cuenta
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] sticky top-8 space-y-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-obsidian-400">Vista de Marca</h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Firma Visual (Color)</label>
                  <div className="flex items-center gap-4 p-4 bg-obsidian-50/50 dark:bg-white/5 rounded-2xl border border-border/50">
                    <input type="color" value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} className="h-10 w-16 rounded-xl cursor-pointer bg-transparent border-0" />
                    <span className="text-xs font-mono font-bold tracking-widest text-obsidian-500 uppercase">{colorPrimario}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Identidad (Logo)</label>
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setLogoFile(e.target.files[0]);
                        setLogoUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-dashed border-obsidian-200 dark:border-white/20 rounded-2xl py-10 flex flex-col items-center justify-center gap-3 transition-all">
                      <ImageIcon size={24} className="text-obsidian-300" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian-400">Cambiar Logo</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 space-y-4">
                  <p className="text-[10px] font-black text-obsidian-400 uppercase tracking-widest">Previsualizacion del Cabezal</p>
                  <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm flex justify-between items-end min-h-[120px]">
                    <div className="max-w-[60%]">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Preview" className="max-h-12 w-auto object-contain" />
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
                <p className="text-[11px] text-amber-800/60 dark:text-amber-400/60 leading-relaxed font-medium">
                  Al eliminar tu cuenta, todos los datos y comprobantes se perderan permanentemente.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
