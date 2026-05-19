"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RestablecerPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Supabase auth handles recovery tokens implicitly. When a user clicks the recovery email, 
    // it opens the site with the access token in the URL hash, logging the user in temporarily.
    // We check if a session is present to confirm they are authenticated to reset.
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If they access this page directly without clicking a reset link
        setError('El enlace de recuperación es inválido, ha expirado o ya se ha utilizado.');
      }
    };
    checkAuth();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.replace('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
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
            <p className="text-obsidian-500 dark:text-obsidian-400 font-medium mt-2">Nueva Contraseña</p>
          </Link>
        </header>

        <div className="glass-card p-10 rounded-3xl relative z-10">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 p-5 rounded-2xl text-sm font-semibold flex flex-col items-center gap-3">
                <CheckCircle2 size={32} className="text-emerald-600" />
                <span>¡Contraseña actualizada con éxito! Redirigiéndote al inicio de sesión...</span>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handlePasswordUpdate}>
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <p className="text-sm text-obsidian-500 dark:text-obsidian-400 leading-relaxed text-center font-medium">
                Ingresa tu nueva contraseña para volver a tomar el control de tu cuenta.
              </p>

              <div className="space-y-2">
                <label htmlFor="pass" className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={18} />
                  <input
                    id="pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-sapphire-500 outline-none transition-all placeholder:text-obsidian-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPass" className="text-xs font-bold text-obsidian-500 uppercase tracking-widest ml-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={18} />
                  <input
                    id="confirmPass"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
