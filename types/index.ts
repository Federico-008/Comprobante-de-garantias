export interface PerfilNegocio {
  nombre: string
  direccion: string
  telefono: string
  logoDataUrl: string | null
  colorPrimario: string
  colorSecundario: string | null
  instagram: string | null
  facebook: string | null
  whatsappMessage: string | null
  plantillaHtml: string
  plantillaRecepcionHtml: string
  proximoCf: number
  configurado: boolean
}

export interface Comprobante {
  id: string
  cfNumber: string
  clienteData: {
    nombre: string
    telefono: string
  }
  productoData: {
    numeroSerie?: string
    modelo?: string
    estadoEstetico?: string
    fallaReportada?: string
    accesorios?: string
    presupuestoEstimado?: string
    trabajoRealizado?: string
  }
  fechaVencimiento: string
  tipo: 'entrega' | 'recepcion'
  createdAt: string
}
