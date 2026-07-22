"use client";

import React, { useState } from 'react';
import { storage } from '@/lib/storage';
import { extractDominantColor } from '@/lib/color-extractor';
import { Store, Palette, MessageSquare, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Paso 1: Datos Generales
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');

  // Paso 2: Logo y Color
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [colorPrimario, setColorPrimario] = useState('#2563eb');
  const [extracting, setExtracting] = useState(false);

  // Paso 3: Redes
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('Hola {{nombre_cliente}}, adjunto el comprobante de garantia de tu equipo: {{link_comprobante}}');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setLogoDataUrl(dataUrl);
      
      setExtracting(true);
      const color = await extractDominantColor(dataUrl);
      if (color) {
        setColorPrimario(color);
      }
      setExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setLoading(true);
    
    // Save to localStorage
    storage.savePerfil({
      nombre,
      direccion,
      telefono,
      logoDataUrl,
      colorPrimario,
      instagram,
      facebook,
      whatsappMessage: whatsapp,
      configurado: true
    });
    
    setLoading(false);
    onComplete();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Store className="text-sapphire-500" /> Datos de tu Negocio
            </h3>
            <p className="text-sm text-obsidian-500">Configura la información principal que aparecerá en tus comprobantes.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                <input
                  type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                  placeholder="Mi Taller..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Dirección</label>
                <input
                  type="text" required value={direccion} onChange={(e) => setDireccion(e.target.value)}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                  placeholder="Av. Falsa 123"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Teléfono</label>
                <input
                  type="text" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                  placeholder="Ej. +54 9 11..."
                />
              </div>
            </div>
            
            <button 
              onClick={() => setStep(2)}
              disabled={!nombre || !direccion || !telefono}
              className="w-full bg-sapphire-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-sapphire-700 transition-all disabled:opacity-50 mt-4"
            >
              Siguiente Paso
            </button>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Palette className="text-sapphire-500" /> Identidad Visual
            </h3>
            <p className="text-sm text-obsidian-500">Sube tu logo. Extraeremos el color principal automáticamente.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Logo del Taller</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-dashed border-obsidian-200 dark:border-white/20 rounded-2xl py-10 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden">
                    {logoDataUrl ? (
                      <img src={logoDataUrl} alt="Logo preview" className="max-h-24 w-auto object-contain z-0 opacity-80" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-obsidian-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian-400">Toca para subir logo</span>
                      </>
                    )}
                    {extracting && (
                      <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm z-20">
                        <Loader2 className="animate-spin text-sapphire-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Color Principal</label>
                <div className="flex items-center gap-4 p-4 bg-obsidian-50/50 dark:bg-white/5 rounded-2xl border border-border/50">
                  <input type="color" value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} className="h-10 w-16 rounded-xl cursor-pointer bg-transparent border-0" />
                  <span className="text-xs font-mono font-bold tracking-widest text-obsidian-500 uppercase">{colorPrimario}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-obsidian-100 dark:bg-white/5 text-foreground font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:opacity-80 transition-all"
              >
                Volver
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 bg-sapphire-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-sapphire-700 transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="text-sapphire-500" /> Redes y Contacto
            </h3>
            <p className="text-sm text-obsidian-500">Estos datos son opcionales pero ayudan a dar más profesionalismo.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Instagram</label>
                  <input
                    type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                    placeholder="@usuario"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Facebook</label>
                  <input
                    type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)}
                    className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                    placeholder="/pagina"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-obsidian-400 uppercase tracking-widest ml-1">Mensaje de WhatsApp Base</label>
                <textarea
                  value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} rows={3}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all resize-none"
                />
                <p className="text-[9px] text-obsidian-400 px-1">Usa {"{{nombre_cliente}}"} y {"{{link_comprobante}}"}</p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => setStep(2)}
                className="flex-1 bg-obsidian-100 dark:bg-white/5 text-foreground font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:opacity-80 transition-all"
              >
                Volver
              </button>
              <button 
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 bg-foreground text-background dark:bg-white dark:text-obsidian-950 font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-all shadow-float flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                {loading ? 'Guardando...' : 'Finalizar'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      
      <div className="glass-card w-full max-w-lg rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-obsidian-100 dark:bg-white/10">
          <div 
            className="h-full bg-sapphire-500 transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mb-8 pt-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sapphire-600 dark:text-sapphire-400">
            Paso {step} de 3
          </div>
          <div className="text-[10px] font-bold text-obsidian-400 tracking-widest">
            GarantiaPro Personal
          </div>
        </div>

        {renderStepContent()}
      </div>
    </div>
  );
}
