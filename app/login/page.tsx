"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/dashboard');
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sapphire-500/10 rounded-full blur-[100px] -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <header className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-sapphire-500 text-white rounded-3xl transition-all group-hover:scale-105 shadow-lg">
                <ShieldCheck size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">GarantiaPro</h1>
            <p className="text-obsidian-500 dark:text-obsidian-400 font-medium mt-2">Accede a tu panel de gestion</p>
          </Link>
        </header>

        <div className="glass-card p-10 rounded-3xl relative z-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={18} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                  placeholder="nombre@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">
                  Contrasena
                </label>
                <Link href="#" className="text-xs font-bold text-sapphire-600 dark:text-sapphire-400 hover:opacity-80 transition">
                  Olvide mi clave
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={18} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background dark:bg-white dark:text-obsidian-950 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-float mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              {loading ? 'Iniciando...' : 'Entrar'}
            </button>
          </form>

          <footer className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-obsidian-500 font-medium">
              No tienes cuenta?{' '}
              <Link href="/registro" className="font-bold text-sapphire-600 dark:text-sapphire-400 hover:opacity-80 transition underline-offset-4 hover:underline">
                Registrate gratis
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
