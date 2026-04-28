# Contexto del Proyecto: Generador de Garantías Pro

## Objetivo
Plataforma SaaS para que negocios emitan comprobantes de garantía profesionales de forma automatizada[cite: 23, 24].

## Stack Tecnológico
- **Framework:** Next.js 14+
- **Estilos:** Tailwind CSS (Diseño profesional y rápido)
- **Backend/DB:** Supabase (Auth, PostgreSQL, Storage)
- **PDF:** html2pdf.js (Conversión de HTML A4 a PDF)

## Reglas de Negocio Innegociables
1. **Identidad:** El logo del usuario se renderiza como marca de agua fija (centro del A4, opacidad 0.15)
2. **Numeración:** Cada comprobante debe tener un código CF correlativo único e incremental
3. **Personalización:** El usuario edita sus términos con un Rich Text Editor. El sistema debe reemplazar las variables {{etiqueta}} antes de generar el PDF
   **Seguridad:** Los usuarios (dueños de negocio) solo pueden ver y editar sus propios datos y garantías (Row Level Security en Supabase)

##Estructura de Datos (Supabase)
- `perfiles_negocio`: id, nombre, logo_url, plantilla_html
- `garantias_emitidas`: id, cf_number, cliente_data (JSONB), producto_data (JSONB), fecha_vencimiento

## Estructura de Archivos 
- /app (Rutas: login, dashboard, generar)
- /components (ui, ComprobantePDF, EditorPlantilla)
- /lib (supabase.ts, generatorCF.ts)
