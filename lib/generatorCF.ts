import { supabase } from './supabase';

/**
 * Genera el próximo código correlativo CF-XXXX
 * Busca en la base de datos la última garantía generada para el negocio y le suma 1.
 */
export async function getNextCFNumber(perfilId: string): Promise<string> {
  // En Supabase, buscamos el registro con el CF más alto de este perfil
  const { data, error } = await supabase
    .from('garantias_emitidas')
    .select('cf_number')
    .eq('perfil_id', perfilId)
    .order('cf_number', { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching last CF number:", error);
    // Fallback inicial en caso de error o tabla vacía
    return "CF-0001";
  }

  if (data && data.length > 0) {
    const lastCF = data[0].cf_number; // ej: "CF-0042"
    if (lastCF && lastCF.startsWith("CF-")) {
      const numberPart = parseInt(lastCF.replace("CF-", ""), 10);
      if (!isNaN(numberPart)) {
        const nextNumber = numberPart + 1;
        // Rellenar con ceros a la izquierda (ej: "CF-0043")
        return `CF-${nextNumber.toString().padStart(4, '0')}`;
      }
    }
  }

  // Si no hay registros previos, comenzamos desde 1
  return "CF-0001";
}
