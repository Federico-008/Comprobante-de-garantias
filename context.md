# Contexto del Proyecto: Generador de Garantías Pro

## Objetivo
[cite_start]Plataforma SaaS para que negocios emitan comprobantes de garantía profesionales de forma automatizada[cite: 23, 24].

## [cite_start]Stack Tecnológico [cite: 66, 68]
- [cite_start]**Framework:** Next.js 14+ (App Router)[cite: 90].
- [cite_start]**Estilos:** Tailwind CSS (Diseño profesional y rápido)[cite: 13, 71].
- [cite_start]**Backend/DB:** Supabase (Auth, PostgreSQL, Storage)[cite: 54, 74].
- [cite_start]**PDF:** html2pdf.js (Conversión de HTML A4 a PDF)[cite: 14, 83].

## Reglas de Negocio Innegociables
1. [cite_start]**Identidad:** El logo del usuario se renderiza como marca de agua fija (centro del A4, opacidad 0.15)[cite: 25, 27, 94].
2. [cite_start]**Numeración:** Cada comprobante debe tener un código CF correlativo único e incremental[cite: 9, 10, 99].
3. **Personalización:** El usuario edita sus términos con un Rich Text Editor. [cite_start]El sistema debe reemplazar las variables {{etiqueta}} antes de generar el PDF[cite: 31, 111].
4. [cite_start]**Seguridad:** Los usuarios (dueños de negocio) solo pueden ver y editar sus propios datos y garantías (Row Level Security en Supabase)[cite: 57].

## [cite_start]Estructura de Datos (Supabase) [cite: 58]
- [cite_start]`perfiles_negocio`: id, nombre, logo_url, plantilla_html[cite: 59].
- [cite_start]`garantias_emitidas`: id, cf_number, cliente_data (JSONB), producto_data (JSONB), fecha_vencimiento[cite: 60, 61].

## [cite_start]Estructura de Archivos [cite: 92, 93]
- /app (Rutas: login, dashboard, generar)
- /components (ui, ComprobantePDF, EditorPlantilla)
- /lib (supabase.ts, generatorCF.ts)