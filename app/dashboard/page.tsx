"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { storage } from '@/lib/storage';
import type { Comprobante, PerfilNegocio } from '@/types';
import Link from 'next/link';
import { 
  FileText, Plus, LogOut, X, MessageCircle, 
  Search, ShieldCheck, Calendar, Activity, ExternalLink,
  LayoutDashboard, Settings, FileSearch, Menu, Trash2, Clock
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import OnboardingModal from '@/components/OnboardingModal';

export default function Dashboard() {
  const [perfil, setPerfil] = useState<PerfilNegocio | null>(null);
  const [garantias, setGarantias] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, cf_number: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const p = storage.getPerfil();
    setPerfil(p);
    
    if (p.configurado) {
      setGarantias(storage.getComprobantes());
    }
    setLoading(false);
  };

  const handleOnboardingComplete = () => {
    loadData();
  };

  const handleDeleteGarantia = (id: string, cf_number: string) => {
    setDeleteTarget({ id, cf_number });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    storage.deleteComprobante(deleteTarget.id);
    setGarantias(storage.getComprobantes());
    setDeleteTarget(null);
  };

  const stats = useMemo(() => {
    const now = new Date();
    const active = garantias.filter(g => new Date(g.fechaVencimiento) > now).length;
    const expiringSoon = garantias.filter(g => {
      const v = new Date(g.fechaVencimiento);
      const diff = v.getTime() - now.getTime();
      return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000); 
    }).length;

    return { total: garantias.length, active, expiringSoon };
  }, [garantias]);

  const filteredGarantias = useMemo(() => {
    return garantias.filter(g => 
      g.clienteData?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.cfNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.productoData?.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <>
      {perfil && !perfil.configurado && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      
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
                        <td className="px-6 py-4 font-mono text-xs"><Link href={`/v/${g.id}`} className="hover:underline">{g.cfNumber}</Link></td>
                        <td className="px-6 py-4">
                          <div className="font-bold">{g.clienteData?.nombre}</div>
                          <div className="text-xs text-obsidian-400">{g.productoData?.modelo}</div>
                        </td>
                        <td className="px-6 py-4">{new Date(g.fechaVencimiento).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteGarantia(g.id, g.cfNumber)} className="text-red-500 hover:opacity-70"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>

        {/* Modal de Confirmación de Eliminación */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-obsidian-950 border border-border/50 dark:border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-xl relative overflow-hidden animate-scale-in">
              <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
              
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-full border border-red-100 dark:border-red-500/20 text-red-600">
                  <Trash2 size={24} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold tracking-tight text-foreground">¿Eliminar Comprobante?</h3>
                  <p className="text-xs text-obsidian-500 dark:text-obsidian-400">
                    Estás a punto de eliminar el comprobante <span className="font-mono font-bold text-red-600">{deleteTarget.cf_number}</span>. 
                    Esta acción es permanente y no se puede deshacer.
                  </p>
                </div>
                
                <div className="flex gap-3 w-full pt-3">
                  <button 
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 bg-obsidian-50 dark:bg-white/5 border border-border/50 dark:border-white/10 hover:bg-obsidian-100 dark:hover:bg-white/10 text-foreground py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-red-600 shadow-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
