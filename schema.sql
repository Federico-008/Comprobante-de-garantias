-- 1. Habilitar la extensión para generar UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear tabla perfiles_negocio
-- Generalmente el ID del negocio está ligado al ID del usuario en auth.users
CREATE TABLE perfiles_negocio (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  logo_url TEXT,
  plantilla_html TEXT,
  plantilla_recepcion_html TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla garantias_emitidas
CREATE TABLE garantias_emitidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cf_number TEXT NOT NULL,
  cliente_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  producto_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE NOT NULL,
  perfil_id UUID NOT NULL REFERENCES perfiles_negocio(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'entrega',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índice para búsquedas rápidas por número de CF por negocio
CREATE INDEX idx_garantias_perfil_cf ON garantias_emitidas(perfil_id, cf_number);

-- ==========================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- ==========================================

-- Habilitar RLS en ambas tablas
ALTER TABLE perfiles_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias_emitidas ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles_negocio:
-- Un usuario solo puede VER su propio perfil
CREATE POLICY "Ver propio perfil" 
ON perfiles_negocio FOR SELECT 
USING (auth.uid() = id);

-- Un usuario solo puede INSERTAR su propio perfil
CREATE POLICY "Insertar propio perfil" 
ON perfiles_negocio FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Un usuario solo puede ACTUALIZAR su propio perfil
CREATE POLICY "Actualizar propio perfil" 
ON perfiles_negocio FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);


-- Políticas para garantias_emitidas:
-- Un usuario solo puede VER las garantías de SU negocio
CREATE POLICY "Ver propias garantías" 
ON garantias_emitidas FOR SELECT 
USING (perfil_id = auth.uid());

-- Un usuario solo puede INSERTAR garantías para SU negocio
CREATE POLICY "Insertar propias garantías" 
ON garantias_emitidas FOR INSERT 
WITH CHECK (perfil_id = auth.uid());

-- Un usuario solo puede ACTUALIZAR las garantías de SU negocio
CREATE POLICY "Actualizar propias garantías" 
ON garantias_emitidas FOR UPDATE 
USING (perfil_id = auth.uid()) 
WITH CHECK (perfil_id = auth.uid());

-- Un usuario solo puede ELIMINAR sus propias garantías (Opcional)
CREATE POLICY "Eliminar propias garantías" 
ON garantias_emitidas FOR DELETE 
USING (perfil_id = auth.uid());

-- ==========================================
-- TRIGER PARA CREAR PERFIL AUTOMÁTICAMENTE
-- ==========================================
-- Esto sirve para que cuando alguien se registre en tu App (auth.users), 
-- se le cree automáticamente una fila en perfiles_negocio.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles_negocio (id, nombre, plantilla_html, plantilla_recepcion_html)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'nombre', 'Mi Negocio'),
    '<h2>Términos de Garantía</h2><p>El presente documento certifica que el producto con número de serie <strong>{{numero_serie}}</strong>... (edite su plantilla)</p>',
    '<h2>Orden de Servicio - Contrato de Depósito</h2><p>Por medio de la presente se deja constancia de la recepción del equipo detallado para su evaluación/reparación. El cliente declara que el equipo ingresa en las condiciones estéticas reportadas.</p>'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
