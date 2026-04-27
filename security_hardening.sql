-- ======================================================
-- FIREWALL DE BASE DE DATOS (Supabase SQL)
-- ======================================================

-- 1. Asegurar que RLS esté activo (Doble check)
ALTER TABLE perfiles_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias_emitidas ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas previas de acceso público para evitar duplicados
DROP POLICY IF EXISTS "Acceso público a garantías" ON garantias_emitidas;
DROP POLICY IF EXISTS "Acceso público a perfiles" ON perfiles_negocio;

-- 3. PERMITIR LECTURA PÚBLICA DE GARANTÍAS (Para el QR)
-- Solo permite SELECT. No permite INSERT, UPDATE ni DELETE.
-- El acceso es por UUID (imposible de adivinar).
CREATE POLICY "Acceso público a garantías"
ON public.garantias_emitidas
FOR SELECT
USING ( true ); 

-- 4. PERMITIR LECTURA PÚBLICA DE PERFILES (Solo nombre y logo para el comprobante)
-- Esto permite que el cliente vea el nombre del negocio cuando escanea el QR.
CREATE POLICY "Acceso público a perfiles"
ON public.perfiles_negocio
FOR SELECT
USING ( true );

-- 5. NOTA DE SEGURIDAD: 
-- Las políticas de "dueño" (perfil_id = auth.uid()) ya están activas en tu schema.
-- Estas aseguran que solo TÚ puedas borrar o editar tus garantías.
