"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Store, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // registro de usuario
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // creamos el perfil del negocio
      const { error: profileError } = await supabase
        .from('perfiles_negocio')
        .insert({
          id: authData.user.id,
          nombre: businessName,
          plantilla_html: `
            <h2>Términos y Garantía</h2>
            <p>Este comprobante certifica que el producto detallado cuenta con garantía oficial de <strong>${businessName}</strong>.</p>
            <h3>Cobertura:</h3>
            <ul>
              <li>Fallas de fabricación.</li>
              <li>Defectos técnicos bajo uso normal.</li>
            </ul>
            <p>La garantía queda anulada si el equipo presenta golpes, humedad o manipulación por terceros.</p>
          `
        });

      if (profileError) throw profileError;

      // Éxito - Redirigir al dashboard (Supabase suele loguear automáticamente tras el signup)
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* aca empieza el registro */}
        <Link href="/" className="inline-flex flex-col items-center group" aria-label="Ir al inicio">
          <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl text-primary group-hover:scale-110 transition duration-300">
            <ShieldCheck size={40} />
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">
            Garantia<span className="text-primary font-light italic">Pro</span>
          </h2>
        </Link>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Crea tu cuenta de negocio y empieza a emitir hoy
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-slate-800">
          <form className="space-y-5" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="businessName" className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Nombre de tu Negocio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Store size={18} />
                </div>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition sm:text-sm bg-gray-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white"
                  placeholder="Ej. Mi Tienda Tech"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition sm:text-sm bg-gray-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white"
                  placeholder="info@tunegocio.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Contraseña (mín. 6 caracteres)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition sm:text-sm bg-gray-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary/20 text-sm font-black text-white bg-primary hover:bg-blue-600 focus:outline-none transition-all active:scale-95 disabled:opacity-50 gap-2 items-center uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                {loading ? 'Creando cuenta...' : 'Registrarse Ahora'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-bold text-primary hover:text-blue-500 transition" aria-label="Iniciar sesión con tu cuenta">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
