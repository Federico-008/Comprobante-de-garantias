"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Zap, Globe, FileCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al dashboard si ya hay una sesión activa
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navegación Simple */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck size={32} />
          <span className="font-black text-2xl tracking-tighter text-gray-900 uppercase">Garantia<span className="text-primary font-light italic">Pro</span></span>
        </div>
        <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-primary transition" aria-label="Acceder a tu cuenta de cliente">Acceso Clientes</Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold animate-fade-in">
              <Zap size={16} /> <span>¡Nuevo! Gestión por WhatsApp</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter">
              Garantías <span className="text-primary italic">Digitales</span> que elevan tu negocio.
            </h1>
            
            <p className="text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Crea, gestiona y envía comprobantes profesionales en segundos. Olvida el papel y digitaliza tu servicio técnico hoy mismo.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link 
                href="/registro" 
                className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary/30 flex items-center gap-2 transition hover:scale-105 active:scale-95"
                aria-label="Empezar a usar GarantiaPro gratis"
              >
                Empezar Gratis <ArrowRight size={20} />
              </Link>
              <Link 
                href="/login" 
                className="text-gray-900 font-bold px-8 py-4 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition"
                aria-label="Iniciar sesión en tu cuenta"
              >
                Iniciar Sesión
              </Link>
            </div>

            {/* Micro Features */}
            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start pt-8 text-sm text-gray-400 font-bold">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Sin Tarjeta de Crédito</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Exportación PDF A4</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Panel Multidispositivo</span>
            </div>
          </div>

          {/* Visual Element / Mockup Placeholder */}
          <div className="relative animate-in slide-in-from-right-10 duration-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent rounded-full blur-3xl opacity-50"></div>
            <div className="relative bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition duration-500">
              <div className="bg-gray-50 rounded-[2rem] p-8 border border-dashed border-gray-200">
                <div className="space-y-4">
                  <div className="h-6 w-3/4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded-full animate-pulse"></div>
                  <div className="pt-10 grid grid-cols-2 gap-4">
                    <div className="h-20 bg-blue-50 rounded-2xl border border-blue-100"></div>
                    <div className="h-20 bg-gray-50 rounded-2xl border border-gray-100"></div>
                  </div>
                  <div className="pt-6 h-32 w-full bg-white rounded-2xl shadow-sm border border-gray-100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm w-fit border border-gray-100"><FileCheck size={24} className="text-primary" /></div>
            <h3 className="font-bold text-xl text-gray-900 tracking-tight">Formato A4 Estándar</h3>
            <p className="text-gray-500 leading-relaxed">Documentos optimizados para impresión física y digital en tamaño oficial A4.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm w-fit border border-gray-100"><Globe size={24} className="text-primary" /></div>
            <h3 className="font-bold text-xl text-gray-900 tracking-tight">Links Compartibles</h3>
            <p className="text-gray-500 leading-relaxed">Envía un enlace único a tus clientes para que descarguen su garantía sin adjuntos.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm w-fit border border-gray-100"><ShieldCheck size={24} className="text-primary" /></div>
            <h3 className="font-bold text-xl text-gray-900 tracking-tight">Firma Digital</h3>
            <p className="text-gray-500 leading-relaxed">Espacios pre-formateados para firmas de cliente y empresa en cada comprobante.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
