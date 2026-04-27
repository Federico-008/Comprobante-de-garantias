import { createClient } from '@supabase/supabase-js';

// Usamos variables de entorno para las credenciales de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Inicializamos el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PerfilNegocio = {
  id: string;
  nombre: string;
  logo_url: string;
  plantilla_html: string;
}

export type GarantiaEmitida = {
  id: string;
  cf_number: string;
  cliente_data: any;
  producto_data: any;
  fecha_vencimiento: string;
  perfil_id: string;
}
