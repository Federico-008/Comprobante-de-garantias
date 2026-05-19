"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { GarantiaEmitida, PerfilNegocio } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, Plus, LogOut, X, MessageCircle, 
  Search, ShieldCheck, Calendar, Activity, ExternalLink,
  LayoutDashboard, Settings, FileSearch, Menu, Trash2, Clock
} from 'lucide-react';
import ComprobantePDF from '@/components/ComprobantePDF';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Dashboard() {
  const [perfil, setPerfil] = useState<PerfilNegocio | null>(null);
  const [garantias, setGarantias] = useState<GarantiaEmitida[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGarantia, setSelectedGarantia] = useState<GarantiaEmitida | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      let { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        await new Promise(r => setTimeout(r, 500));
        const retry = await supabase.auth.getSession();
        session = retry.data.session;
      }

      if (!session) {
        router.replace('/login');
        return;
      }
      
      const { data: perfiles } = await supabase
        .from('perfiles_negocio')
        .select('*')
        .eq('id', session.user.id);
        
      if (perfiles && perfiles.length > 0) {
        setPerfil(perfiles[0]);
      }

      const { data: garantiasList } = await supabase
        .from('garantias_emitidas')
        .select('*')
        .eq('perfil_id', session.user.id)
        .order('created_at', { ascending: false });

      if (garantiasList) setGarantias(garantiasList);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteGarantia = async (id: string, cf_number: string) => {
    if (!confirm(`Eliminar comprobante ${cf_number}?`)) return;
    
    try {
      const { error } = await supabase.from('garantias_emitidas').delete().eq('id', id);
      if (error) throw error;
      setGarantias(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const active = garantias.filter(g => new Date(g.fecha_vencimiento) > now).length;
    const expiringSoon = garantias.filter(g => {
      const v = new Date(g.fecha_vencimiento);
      const diff = v.getTime() - now.getTime();
      return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000); 
    }).length;

    return { total: garantias.length, active, expiringSoon };
  }, [garantias]);

  const filteredGarantias = useMemo(() => {
    return garantias.filter(g => 
      g.cliente_data?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.cf_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.producto_data?.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [garantias, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-sapphire-500/10 border-t-sapphire-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row transition-colors">
      <div className="lg:hidden bg-white/80 dark:bg-obsidian-950/80 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <ShieldCheck size={20} className="text-primary dark:text-white" />
          <span>GarantiaPro</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-obsidian-50 dark:hover:bg-white/5 rounded-md"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-obsidian-950 text-white flex flex-col z-[60] transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:m-4 lg:rounded-3xl lg:shadow-float border border-white/10
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex-1">
          <div className="hidden lg:flex items-center gap-3 font-bold text-xl tracking-tight mb-12">
            <div className="bg-sapphire-500 p-1.5 rounded-xl">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <span className="text-white">GarantiaPro</span>
          </div>

          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 bg-sapphire-600/20 text-sapphire-400 rounded-2xl font-semibold text-sm transition-all border border-sapphire-500/20"
            >
              <LayoutDashboard size={18} /> Panel Principal
            </Link>
            <Link 
              href="/plantillas" 
              className="flex items-center gap-3 px-4 py-3 text-obsidian-400 hover:text-white hover:bg-white/5 rounded-2xl font-medium text-sm transition-all"
            >
              <FileSearch size={18} /> Mis Plantillas
            </Link>
            <Link 
              href="/configuracion" 
              className="flex items-center gap-3 px-4 py-3 text-obsidian-400 hover:text-white hover:bg-white/5 rounded-2xl font-medium text-sm transition-all"
            >
              <Settings size={18} /> Configuracion
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-white/10 space-y-6">
          <ThemeToggle />
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-obsidian-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl font-medium text-sm transition-colors"
          >
            <LogOut size={18} /> Salir
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto pt-4 lg:pt-0">
        <header className="hidden lg:flex px-10 py-8 justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Vision General</h1>
            <p className="text-sm text-obsidian-500 dark:text-obsidian-400 mt-1">Bienvenido, {perfil?.nombre || 'usuario'}.</p>
          </div>
          <Link 
            href="/generar" 
            className="bg-foreground text-background dark:bg-white dark:text-obsidian-950 px-6 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-float"
          >
            <Plus size={18} /> Nueva Operacion
          </Link>
        </header>

        <main className="p-6 lg:px-10 lg:pb-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <span className="text-xs font-bold text-obsidian-500 uppercase tracking-widest">Total Emitidas</span>
              <h3 className="text-4xl font-light tracking-tighter text-foreground">{stats.total}</h3>
            </div>
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <span className="text-xs font-bold text-obsidian-500 uppercase tracking-widest">Activas</span>
              <h3 className="text-4xl font-light tracking-tighter text-foreground">{stats.active}</h3>
            </div>
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <span className="text-xs font-bold text-obsidian-500 uppercase tracking-widest">Vencimientos</span>
              <h3 className="text-4xl font-light tracking-tighter text-foreground">{stats.expiringSoon}</h3>
            </div>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-xl font-bold tracking-tight">Historial</h2>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={16} />
                <input 
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-obsidian-50/50 dark:bg-white/5 border border-border/50 rounded-2xl text-sm outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-obsidian-50/50 dark:bg-white/5 border-b border-border/50">
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-obsidian-400">ID</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-obsidian-400">Cliente</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-obsidian-400">Vencimiento</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredGarantias.map((g) => (
                    <tr key={g.id} className="hover:bg-obsidian-50/30 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{g.cf_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{g.cliente_data?.nombre}</div>
                        <div className="text-xs text-obsidian-400">{g.producto_data?.modelo}</div>
                      </td>
                      <td className="px-6 py-4">{new Date(g.fecha_vencimiento).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteGarantia(g.id, g.cf_number)} className="text-red-500 hover:opacity-70"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
