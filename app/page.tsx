"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Zap, Globe, FileCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-sapphire-500/20 selection:text-sapphire-600">
      {/* Datos Estructurados JSON-LD para Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "GarantiaPro",
            "operatingSystem": "All",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Sistema profesional para la creación y gestión de garantías y órdenes de servicio digitales para técnicos y comercios. Envía comprobantes con QR por WhatsApp.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "128"
            }
          })
        }}
      />

      {/* Navbar */}
      <nav className="border-b border-border/50 bg-white/70 dark:bg-obsidian-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
            <div className="bg-sapphire-500 p-1.5 rounded-xl shadow-inner-soft">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-foreground">GarantiaPro</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-obsidian-500 hover:text-foreground transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="bg-foreground text-background dark:bg-white dark:text-obsidian-950 px-6 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-float">
              Registrarse Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-sapphire-100/50 dark:from-sapphire-900/20 to-transparent rounded-full blur-3xl -z-10 opacity-70"></div>
        
        <div className="max-w-5xl mx-auto px-6 text-center space-y-10 relative z-10">
          <div className="inline-flex items-center gap-2 bg-sapphire-50 dark:bg-sapphire-500/10 text-sapphire-600 dark:text-sapphire-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-sapphire-200/50 dark:border-sapphire-500/20 animate-fade-in shadow-sm">
            <Zap size={14} /> La nueva era de la garantía digital
          </div>
          
          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[1.1] text-foreground">
            Emite comprobantes <br className="hidden md:block" />
            <span className="font-light italic text-obsidian-400">impecables</span> en segundos.
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-obsidian-500 dark:text-obsidian-400 font-normal leading-relaxed">
            La herramienta definitiva diseñada exclusivamente para técnicos y negocios que exigen la máxima profesionalidad. Olvida el papel y transmite excelencia.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/registro" className="w-full sm:w-auto bg-sapphire-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-sapphire-700 transition-all flex items-center justify-center gap-2 shadow-float border border-sapphire-500">
              Comenzar Ahora <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="w-full sm:w-auto bg-white/50 dark:bg-white/5 text-foreground border border-border/50 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-obsidian-50 dark:hover:bg-white/10 transition-all backdrop-blur-sm">
              Ver Características
            </Link>
          </div>
          
          <div className="pt-16 max-w-5xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-200">
               <div className="bg-slate-900 rounded-xl aspect-video flex items-center justify-center text-white overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                  <div className="relative z-10 text-center space-y-4 px-6">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full inline-block border border-white/20">
                      <FileCheck size={32} />
                    </div>
                    <p className="text-xl font-medium">Dashboard Profesional Interactivo</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-foreground">Todo lo que tu negocio necesita</h2>
            <p className="text-obsidian-500 dark:text-obsidian-400 max-w-xl mx-auto text-lg">Diseñado con obsesión por los detalles para ser rápido, intuitivo y altamente profesional.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<FileCheck className="text-sapphire-600" />} 
              title="PDF de Grado Ejecutivo" 
              desc="Plantillas A4 diseñadas con proporciones áureas. Tus clientes recibirán un documento que grita calidad y respaldo."
            />
            <FeatureCard 
              icon={<Zap className="text-emerald-600" />} 
              title="Emisión Ultra-Rápida" 
              desc="Olvídate de procesos lentos. Nuestro formulario optimizado te permite emitir comprobantes en menos de 30 segundos."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-orange-500" />} 
              title="Historial Blindado" 
              desc="Accede al instante a todo el historial de reparaciones y ventas de cualquier cliente. Nunca más pierdas un dato vital."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-white/30 dark:bg-obsidian-950/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-obsidian-400">
            <ShieldCheck size={20} />
            <span>GarantiaPro</span>
          </div>
          <p className="text-obsidian-400 text-sm font-medium">&copy; 2026 GarantiaPro. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-obsidian-400 hover:text-foreground transition text-sm font-medium">Términos</Link>
            <Link href="#" className="text-obsidian-400 hover:text-foreground transition text-sm font-medium">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300 group">
      <div className="bg-obsidian-50 dark:bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-border/50 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight text-foreground">{title}</h3>
      <p className="text-obsidian-500 dark:text-obsidian-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
