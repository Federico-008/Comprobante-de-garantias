"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Loader2, UserPlus, Store } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log("Sistema: Pagina de Registro cargada correctamente.");
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log("Sistema: Iniciando proceso de registro...");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { nombre: businessName }
        }
      });

      if (authError) {
        console.error("Error Auth:", authError.message);
        throw authError;
      }

      console.log("Sistema: Registro enviado exitosamente.");
      alert("¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta y luego inicia sesión.");
      
      router.push('/login');
    } catch (err: any) {
      const msg = err.message || 'Error desconocido en el registro';
      console.error("Sistema: ERROR CRITICO ->", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sapphire-500/10 rounded-full blur-[100px] -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <header className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-sapphire-500 text-white rounded-3xl shadow-lg transition-transform hover:scale-105">
                <ShieldCheck size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">GarantiaPro</h1>
            <p className="text-obsidian-500 dark:text-obsidian-400 font-medium mt-2">Crea tu cuenta profesional</p>
          </Link>
        </header>

        <div className="glass-card p-10 rounded-3xl relative z-10 border border-border/50">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-sm font-bold text-center animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Nombre de tu Negocio</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={18} />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                  placeholder="Ej. Mi Servicio Tecnico"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Email Profesional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                  placeholder="info@negocio.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all"
                  placeholder="Minimo 6 caracteres"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sapphire-600 text-white py-4 rounded-2xl font-bold hover:bg-sapphire-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sapphire-500/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              {loading ? 'Procesando registro...' : 'Crear mi cuenta gratis'}
            </button>
          </form>

          <footer className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-obsidian-500 font-medium">
              ¿Ya eres miembro?{' '}
              <Link href="/login" className="font-bold text-sapphire-600 dark:text-sapphire-400 hover:underline">
                Inicia sesion aqui
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
