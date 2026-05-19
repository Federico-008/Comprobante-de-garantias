"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Mail, Loader2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/restablecer`,
      });

      if (resetError) throw resetError;

      setMessage('Te hemos enviado un correo con las instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación');
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
            <p className="text-obsidian-500 dark:text-obsidian-400 font-medium mt-2">Recuperar Contraseña</p>
          </Link>
        </header>

        <div className="glass-card p-10 rounded-3xl relative z-10">
          {message ? (
            <div className="space-y-6 text-center">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 p-5 rounded-2xl text-sm font-semibold">
                {message}
              </div>
              <Link
                href="/login"
                className="w-full bg-foreground text-background dark:bg-white dark:text-obsidian-950 py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-float"
              >
                <ArrowLeft size={18} /> Volver al Inicio
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleResetRequest}>
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <p className="text-sm text-obsidian-500 dark:text-obsidian-400 leading-relaxed text-center font-medium">
                Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu clave.
              </p>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">
                  Correo Electrónico
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background dark:bg-white dark:text-obsidian-950 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-float mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                {loading ? 'Enviando enlace...' : 'Enviar Enlace'}
              </button>
            </form>
          )}

          {!message && (
            <footer className="mt-8 pt-8 border-t border-border/50 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-sapphire-600 dark:text-sapphire-400 hover:opacity-80 transition">
                <ArrowLeft size={16} /> Volver a iniciar sesión
              </Link>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
