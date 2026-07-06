import { PerfilNegocio, Comprobante } from '@/types'

const PERFIL_KEY = 'garantias_perfil_v1'
const COMPROBANTES_KEY = 'garantias_comprobantes_v1'

let cachedPerfil: PerfilNegocio | null = null;
let cachedComprobantes: Comprobante[] | null = null;

const defaultPerfil: PerfilNegocio = {
  nombre: '',
  direccion: '',
  telefono: '',
  logoDataUrl: null,
  colorPrimario: '#3b82f6',
  colorSecundario: null,
  instagram: null,
  facebook: null,
  whatsappMessage: 'Hola {{nombre_cliente}}, adjunto el comprobante de garantia de tu equipo: {{link_comprobante}}',
  plantillaHtml: '<h2>Términos de Garantía</h2><p>El presente documento certifica que el producto con número de serie <strong>{{numero_serie}}</strong>... (edite su plantilla)</p>',
  plantillaRecepcionHtml: '<h2>Orden de Servicio - Contrato de Depósito</h2><p>Por medio de la presente se deja constancia de la recepción del equipo detallado para su evaluación/reparación. El cliente declara que el equipo ingresa en las condiciones estéticas reportadas.</p>',
  proximoCf: 1,
  configurado: false
}

export const storage = {
  // Perfil
  getPerfil(): PerfilNegocio {
    if (cachedPerfil) return cachedPerfil;
    if (typeof window === 'undefined') return defaultPerfil;
    
    try {
      const stored = localStorage.getItem(PERFIL_KEY);
      if (stored) {
        cachedPerfil = JSON.parse(stored);
        return cachedPerfil as PerfilNegocio;
      }
    } catch (e) {
      console.error('Error parsing perfil from localStorage', e);
    }
    
    return defaultPerfil;
  },
  
  savePerfil(perfil: Partial<PerfilNegocio>): void {
    const current = this.getPerfil();
    const updated = { ...current, ...perfil };
    cachedPerfil = updated;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(PERFIL_KEY, JSON.stringify(updated));
    }
  },
  
  resetPerfil(): void {
    cachedPerfil = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PERFIL_KEY);
    }
  },
  
  // Comprobantes
  getComprobantes(): Comprobante[] {
    if (cachedComprobantes) return cachedComprobantes;
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(COMPROBANTES_KEY);
      if (stored) {
        cachedComprobantes = JSON.parse(stored);
        return cachedComprobantes || [];
      }
    } catch (e) {
      console.error('Error parsing comprobantes from localStorage', e);
    }
    
    return [];
  },
  
  getComprobanteById(id: string): Comprobante | null {
    const comprobantes = this.getComprobantes();
    return comprobantes.find(c => c.id === id) || null;
  },
  
  saveComprobante(comprobante: Comprobante): void {
    const comprobantes = this.getComprobantes();
    const index = comprobantes.findIndex(c => c.id === comprobante.id);
    
    if (index >= 0) {
      comprobantes[index] = comprobante;
    } else {
      // Add to beginning
      comprobantes.unshift(comprobante);
    }
    
    cachedComprobantes = comprobantes;
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPROBANTES_KEY, JSON.stringify(comprobantes));
    }
  },
  
  deleteComprobante(id: string): void {
    const comprobantes = this.getComprobantes().filter(c => c.id !== id);
    cachedComprobantes = comprobantes;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPROBANTES_KEY, JSON.stringify(comprobantes));
    }
  },
  
  getNextCfNumber(): string {
    const perfil = this.getPerfil();
    const current = perfil.proximoCf || 1;
    
    // Increment for next time
    this.savePerfil({ proximoCf: current + 1 });
    
    return `CF-${current.toString().padStart(4, '0')}`;
  },
  
  // Utilidades
  clear(): void {
    cachedPerfil = null;
    cachedComprobantes = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PERFIL_KEY);
      localStorage.removeItem(COMPROBANTES_KEY);
    }
  }
}
