"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { supabase, GarantiaEmitida, PerfilNegocio } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, Plus, LogOut, ArrowRight, X, MessageCircle, 
  Search, ShieldCheck, Calendar, Users, Activity, ExternalLink,
  ChevronRight, LayoutDashboard, Settings, FileSearch, Menu
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

  // aca se checkea el usuario
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    console.log("Verificando sesión en Dashboard...");
    try {
      let { data: { session } } = await supabase.auth.getSession();
      
      // si no hay sesion, esperar un poquito y reintentar (por si el redirect fue muy rapido)
      if (!session) {
        console.log("Sesión no encontrada inicialmente, reintentando en 500ms...");
        await new Promise(r => setTimeout(r, 500));
        const retry = await supabase.auth.getSession();
        session = retry.data.session;
      }

      if (!session) {
        console.log("Sesión fallida tras reintento, volviendo a login");
        router.replace('/login');
        return;
      }
      
      console.log("Sesión activa:", session.user.id);

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

  // aca estan las estadisticas y filtros
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Activity className="animate-spin text-primary mb-4" size={40} />
        <p className="text-gray-500 font-medium animate-pulse">Cargando tu ecosistema...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col lg:flex-row transition-colors duration-300">
      {/* header mobile */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck size={24} />
          <span className="font-black text-lg tracking-tight dark:text-white">GARANTIA<span className="text-primary text-xs">PRO</span></span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col z-[60] transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="hidden lg:flex items-center gap-3 text-primary mb-8">
            <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
              <ShieldCheck size={28} />
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white">GARANTIA<span className="text-primary text-sm">PRO</span></span>
          </div>

          <nav className="space-y-1">
            <Link 
              href="/dashboard" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 bg-primary/5 dark:bg-primary/10 text-primary rounded-xl font-bold transition shadow-sm border border-primary/10 dark:border-primary/20"
            >
              <LayoutDashboard size={20} /> Panel Principal
            </Link>
            <Link 
              href="/plantillas" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl font-medium transition group"
            >
              <FileSearch size={20} className="group-hover:text-primary transition" /> Mis Plantillas
            </Link>
            <Link 
              href="/configuracion" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl font-medium transition group"
            >
              <Settings size={20} className="group-hover:text-primary transition" /> Configuración
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4 border-t border-gray-100 dark:border-slate-800">
          <div className="px-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Apariencia</p>
            <ThemeToggle />
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-bold transition"
          >
            <LogOut size={20} /> Salir
          </button>
        </div>
      </aside>

      {/* contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior - Desktop (Oculto el título en móvil porque ya está en el mobile header) */}
        <header className="hidden lg:flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-8 py-4 justify-between items-center sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Hola, {perfil?.nombre || 'Bienvenido'}</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">Gestión de garantías en tiempo real</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link 
              href="/generar" 
              className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition hover:scale-105 active:scale-95"
            >
              <Plus size={18} /> Nueva Garantía
            </Link>
          </div>
        </header>

        {/* Botón flotante para móvil */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Link 
            href="/generar" 
            className="bg-primary hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center transition active:scale-90"
          >
            <Plus size={28} />
          </Link>
        </div>

        <main className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-primary/30 transition">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Total Emitidas</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-green-200 transition">
              <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-xl text-green-600 dark:text-green-400 group-hover:scale-110 transition">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Activas</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.active}</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-orange-200 transition">
              <div className="bg-orange-50 dark:bg-orange-500/10 p-3 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Próximas a vencer</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.expiringSoon}</h3>
              </div>
            </div>
          </div>

          {/* historial de garantias */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden shadow-gray-200/50 dark:shadow-none">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                Historial de Operaciones
              </h2>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar por cliente o CF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition dark:text-white"
                />
              </div>
            </div>

            {filteredGarantias.length === 0 ? (
              <div className="p-20 text-center text-gray-500">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <FileSearch size={32} className="text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-400">No se encontraron registros</p>
                <p className="text-sm mt-1">Intenta con otro término de búsqueda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
<thead className="bg-slate-800/40 border-b border-slate-700 text-slate-400 uppercase tracking-tighter text-[10px] font-black">                    <tr>
                      <th className="px-6 py-4">Correlativo</th>
                      <th className="px-6 py-4">Información del Cliente</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4">Vencimiento</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                    {filteredGarantias.map((g) => {
                      const isExpired = new Date(g.fecha_vencimiento) < new Date();
                      return (
                        <tr key={g.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition group">
                          <td className="px-6 py-5">
                            <span className="font-mono font-bold text-primary bg-primary/5 dark:bg-primary/10 px-2 py-1 rounded text-xs border border-primary/10">
                              {g.cf_number}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-gray-900 dark:text-white">{g.cliente_data?.nombre || 'Sin nombre'}</div>
                            <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 font-medium uppercase">{g.producto_data?.modelo || 'Sin modelo'}</div>
                            <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                              <Activity size={10} /> Control: {g.cf_number}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {isExpired ? (
                              <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-100 dark:border-red-500/20">Vencida</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider border border-green-100 dark:border-green-500/20">Vigente</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400 dark:text-slate-500" />
                              {new Date(g.fecha_vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedGarantia(g);
                                  setIsModalOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition"
                                title="Ver Detalles"
                                aria-label={`Ver detalles de garantía ${g.cf_number}`}
                              >
                                <ExternalLink size={18} />
                              </button>
                              <a 
                                href={`https://wa.me/${(g.cliente_data?.telefono || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${g.cliente_data?.nombre || ''}, aquí tienes el link oficial de tu garantía por el equipo ${g.producto_data?.modelo || ''} (${g.cf_number}): ${window.location.origin}/v/${g.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition"
                                title="Enviar por WhatsApp"
                                aria-label={`Enviar comprobante ${g.cf_number} por WhatsApp`}
                              >
                                <MessageCircle size={18} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* modal del pdf */}
      {isModalOpen && selectedGarantia && perfil && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                  Comprobante Oficial <span className="text-primary font-mono">{selectedGarantia.cf_number}</span>
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Registrado el {new Date(selectedGarantia.created_at || '').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
                aria-label="Cerrar vista previa"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-slate-950/50">
              <ComprobantePDF 
                negocio={perfil}
                garantia={selectedGarantia}
                plantillaTexto={perfil.plantilla_html || ''}
                shareUrl={`${window.location.origin}/v/${selectedGarantia.id}`}
              />
            </div>
            <div className="p-6 border-t dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
               <p className="text-xs text-gray-400 dark:text-slate-500 italic">Previsualización segura de documento legal.</p>
               <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-2.5 bg-gray-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-gray-200 transition shadow-lg active:scale-95"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
