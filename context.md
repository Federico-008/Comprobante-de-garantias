# GarantiaPro — Documento de Contexto del Sistema

> Última actualización: Julio 2026  
> Autor: Guillermo Federico Ramirez  
> Estado del proyecto: **Desarrollo activo — MVP funcional**

---

## 1. Resumen Ejecutivo

**GarantiaPro** es un SaaS web orientado a técnicos de electrónica, talleres de reparación y comercios que necesitan emitir comprobantes digitales profesionales (garantías y órdenes de servicio). El sistema permite generar, almacenar y compartir documentos con código QR de verificación pública, todo desde un panel privado basado en autenticación por email/password.

**Problema que resuelve:**  
Técnicos y comercios que operan con tickets en papel, WhatsApp o archivos sueltos. GarantiaPro los reemplaza con un flujo digital, rastreable y profesional.

**URL de producción estimada:** `https://garantiapro.vercel.app`

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| **Next.js** | ^14.2.3 (App Router) | Framework principal (SSR + routing) |
| **React** | ^18 | Librería de UI |
| **TypeScript** | ^5 | Tipado estático |
| **Tailwind CSS** | ^3.4.1 | Estilos utilitarios |
| **next-themes** | ^0.4.6 | Modo claro/oscuro |
| **lucide-react** | ^0.400.0 | Sistema de iconos |
| **Outfit** (Google Fonts) | — | Tipografía principal vía `next/font` |

### Editor de Texto Enriquecido
| Tecnología | Versión | Rol |
|---|---|---|
| **Quill** | ^2.0.2 | Motor del editor WYSIWYG |
| **react-quill** | ^2.0.0 | Wrapper React (cargado dinámicamente con `next/dynamic`, `ssr: false`) |

### Generación de PDF
| Tecnología | Versión | Rol |
|---|---|---|
| **html2pdf.js** | ^0.10.1 | Convierte el DOM del comprobante a PDF descargable |

### QR
| Tecnología | Versión | Rol |
|---|---|---|
| **qrcode.react** | ^4.2.0 | Genera el código QR SVG incrustado en el comprobante |

### Backend / BaaS
| Tecnología | Versión | Rol |
|---|---|---|
| **Supabase** | ^2.43.4 | Base de datos PostgreSQL, Auth, Storage |

### Gestor de Paquetes
- **pnpm** (con `pnpm-workspace.yaml`)

### DevDependencies
- `@tailwindcss/typography` — plugin prose para Quill
- `autoprefixer`, `postcss` — procesado de CSS
- `eslint` + `eslint-config-next` — linting

---

## 3. Arquitectura del Sistema

```
+-----------------------------------------------------------------+
|                         USUARIO FINAL                           |
|  (Técnico con cuenta)            (Cliente escaneando QR)        |
+------------------+------------------------------+---------------+
                   |                              |
                   v                              v
+---------------------------+       +-----------------------------+
|    Panel Privado          |       |   Vista Pública /v/[id]     |
|  /dashboard               |       |  (sin autenticación)        |
|  /generar                 |       |  Comprobante verificable    |
|  /configuracion           |       +-------------+---------------+
|  /plantillas              |                     |
+----------+----------------+                     |
           |                                      |
           v                                      v
+------------------------------------------------------------------------+
|                         Supabase (BaaS)                                |
|  +-----------------+  +--------------------+  +--------------------+  |
|  |  Auth           |  |  PostgreSQL DB     |  |  Storage           |  |
|  |  (email+pass)   |  |  + RLS Policies    |  |  bucket: logos     |  |
|  +-----------------+  +--------------------+  +--------------------+  |
+------------------------------------------------------------------------+
```

### Patrón de Autenticación
- La sesión se maneja a través del **cliente de Supabase en el browser** (`localStorage`), no con cookies del servidor.
- Cada página protegida ejecuta `supabase.auth.getSession()` en un `useEffect` y redirige a `/login` si no hay sesión.
- El `middleware.ts` existe pero **está desactivado** (solo pasa `NextResponse.next()`). La protección de rutas es client-side.
- Rutas cubiertas por el matcher (aunque inactivo): `/dashboard/*`, `/generar/*`, `/configuracion/*`, `/plantillas/*`.

---

## 4. Estructura de Archivos

```
Generador de comprobantes/
├── app/
│   ├── layout.tsx              # Layout raíz: fuente Outfit, ThemeProvider, SEO global, noise overlay
│   ├── globals.css             # Variables CSS, glass-card, bg-noise, @media print, animaciones
│   ├── page.tsx                # Landing page pública con JSON-LD SEO
│   ├── robots.ts               # Robots.txt generado dinámicamente
│   ├── sitemap.ts              # Sitemap generado dinámicamente
│   ├── login/page.tsx          # Formulario login con email/password (Supabase Auth)
│   ├── registro/page.tsx       # Registro (crea cuenta + perfil_negocio vía trigger)
│   ├── recuperar/page.tsx      # Solicitud de reset de contraseña
│   ├── restablecer/page.tsx    # Confirmación del reset (con token de URL)
│   ├── dashboard/page.tsx      # Panel: stats, historial, búsqueda, sidebar
│   ├── generar/page.tsx        # Formulario nueva operación + preview A4 tiempo real
│   ├── configuracion/page.tsx  # Config del negocio: logo, color, plantillas, RRSS, seguridad
│   ├── plantillas/page.tsx     # Monta GestorPlantillas
│   └── v/[id]/page.tsx         # Vista pública del comprobante (sin auth, por UUID)
├── components/
│   ├── ComprobantePDF.tsx      # Documento A4 (preview + PDF + imprimir + QR)
│   ├── EditorPlantilla.tsx     # Editor Quill WYSIWYG con etiquetas dinámicas
│   ├── GestorPlantillas.tsx    # CRUD de plantillas locales + SelectorPlantilla
│   ├── ThemeProvider.tsx       # Wrapper de next-themes
│   └── ThemeToggle.tsx         # Toggle claro/oscuro
├── lib/
│   ├── supabase.ts             # Cliente Supabase + tipos (PerfilNegocio, GarantiaEmitida)
│   └── generatorCF.ts          # getNextCFNumber(): genera próximo CF-XXXX
├── types/
│   └── html2pdf.d.ts           # Declaración de tipos para html2pdf.js
├── schema.sql                  # Schema completo de Supabase con RLS
├── security_hardening.sql      # Políticas adicionales de lectura pública para QR
├── middleware.ts               # Middleware Next.js (desactivado actualmente)
├── tailwind.config.ts          # Paleta obsidian + sapphire, sombras personalizadas
├── .env.local                  # NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
└── DOCUMENTACION.md            # Documentación adicional del proyecto
```

---

## 5. Base de Datos (Supabase / PostgreSQL)

### Tabla: `perfiles_negocio`
Vinculada 1:1 con `auth.users`. Se crea automáticamente vía trigger al registrarse.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | FK a `auth.users(id)` — mismo ID del usuario autenticado |
| `nombre` | TEXT NOT NULL | Nombre comercial del negocio |
| `logo_url` | TEXT | URL pública del logo (Supabase Storage bucket `logos`) |
| `plantilla_html` | TEXT | HTML del template de garantía/entrega (editable con Quill) |
| `plantilla_recepcion_html` | TEXT | HTML del template de recepción/orden de servicio |
| `direccion` | TEXT | Dirección física del negocio |
| `telefono` | TEXT | Teléfono de contacto |
| `color_primario` | TEXT | Color hex de branding en el PDF (default `#3b82f6`) |
| `instagram_user` | TEXT | Usuario de Instagram |
| `facebook_user` | TEXT | Página de Facebook |
| `mensaje_whatsapp_predeterminado` | TEXT | Plantilla de mensaje con `{{nombre_cliente}}` y `{{link_comprobante}}` |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### Tabla: `garantias_emitidas`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Auto-generado. También es el ID en la URL pública `/v/[id]` |
| `cf_number` | TEXT NOT NULL | Número correlativo `CF-XXXX` (ej: `CF-0042`) |
| `cliente_data` | JSONB | `{ nombre, telefono }` |
| `producto_data` | JSONB | `{ numero_serie, modelo, estado_estetico, falla_reportada, accesorios, presupuesto_estimado, trabajo_realizado }` |
| `fecha_vencimiento` | TIMESTAMPTZ NOT NULL | Calculada con los días de cobertura ingresados |
| `perfil_id` | UUID FK | Referencia a `perfiles_negocio(id)` |
| `tipo` | TEXT | `'entrega'` o `'recepcion'` |
| `created_at` | TIMESTAMPTZ | Fecha de emisión |

**Índice:** `idx_garantias_perfil_cf` sobre `(perfil_id, cf_number)`.

### Row Level Security (RLS)
- **`perfiles_negocio`**: SELECT / INSERT / UPDATE solo cuando `auth.uid() = id`.
- **`garantias_emitidas`**: SELECT / INSERT / UPDATE / DELETE solo cuando `perfil_id = auth.uid()`.
- **Lectura pública** (para el QR): ambas tablas tienen políticas de SELECT sin restricción (`USING (true)`), definidas en `security_hardening.sql`.

### Trigger Automático
Al registrarse un nuevo usuario, `on_auth_user_created` ejecuta `handle_new_user()` que inserta automáticamente en `perfiles_negocio` con el nombre del `raw_user_meta_data->>'nombre'` y plantillas HTML por defecto.

### Storage
- **Bucket:** `logos`
- Convención de nombre: `{perfil_id}-{timestamp}.{ext}`
- URL pública con `supabase.storage.from('logos').getPublicUrl(fileName)`

---

## 6. Flujos Principales

### 6.1 Registro
1. Formulario `/registro` (email, password, nombre).
2. `supabase.auth.signUp()` con `options.data = { nombre }`.
3. Trigger crea `perfiles_negocio` automáticamente.
4. Redirección a `/dashboard`.

### 6.2 Login
1. `supabase.auth.signInWithPassword()` en `/login`.
2. Sesión en `localStorage`.
3. Redirección a `/dashboard`.

### 6.3 Emisión de Comprobante (`/generar`)
1. Carga perfil + próximo CF (`getNextCFNumber()`).
2. Usuario elige tipo: `Recepción` (orden de servicio) o `Entrega` (garantía).
3. Completa formulario dinámico (campos cambian según tipo).
4. Preview A4 en tiempo real en panel derecho.
5. Puede cargar texto desde plantillas guardadas (SelectorPlantilla).
6. Al descargar/imprimir → `handleSaveToDB()` → inserta en DB → genera `shareUrl = /v/{id}`.
7. CF-number se autoincrementa.

### 6.4 Vista Pública QR (`/v/[id]`)
1. Ruta pública sin auth.
2. Consulta `garantias_emitidas` por UUID.
3. Consulta `perfiles_negocio` por `perfil_id`.
4. Renderiza `ComprobantePDF` en modo lectura.
5. Cliente puede descargar PDF o imprimir.

### 6.5 Dashboard (`/dashboard`)
- Stats: Total / Activas / Por vencer (próximos 7 días).
- Historial con búsqueda (nombre, CF, número de serie).
- Eliminar comprobante con modal de confirmación.
- Sidebar con navegación, ThemeToggle y Logout.

### 6.6 Configuración (`/configuracion`)
- Nombre, dirección, teléfono.
- Instagram, Facebook, plantilla de WhatsApp con variables dinámicas.
- Dos editores Quill: plantilla de recepción + plantilla de entrega.
- Color primario (color picker) + logo (upload a Storage).
- Cambio de contraseña con `supabase.auth.updateUser({ password })`.
- Exportar datos como CSV.
- Eliminar cuenta (bug pendiente: requiere service_role key).

### 6.7 Gestor de Plantillas (`/plantillas`)
- CRUD de templates de texto guardados en **`localStorage`** (clave `garantias_plantillas_v1`).
- NO sincronizados con Supabase — locales al dispositivo.
- `SelectorPlantilla`: dropdown de carga rápida desde `/generar`.

---

## 7. Componentes Clave

### `ComprobantePDF.tsx`
- Renderiza el documento en un `div` con dimensiones físicas `210mm × 297mm`.
- Escalado dinámico via `ResizeObserver` + `useLayoutEffect` para el preview.
- Detecta overflow de contenido y notifica al padre via `onOverflowChange`.
- QR de verificación con `QRCodeSVG` apuntando a `/v/{garantia.id}`.
- Etiquetas dinámicas: `{{nombre_cliente}}`, `{{numero_serie}}`, `{{cf_number}}`.
- Botón PDF → `onSave` + `html2pdf.js`.
- Botón imprimir → `onSave` + `window.print()`.
- Marca de agua con logo/nombre del negocio (rotado -35°, opacidad 4%).

### `EditorPlantilla.tsx`
- Editor Quill cargado con `next/dynamic` + `ssr: false`.
- Toolbar: headings, bold, italic, underline, strike, listas, clean.
- Helper bar mostrando las etiquetas dinámicas disponibles.
- Modo `disabled`: bloquea agregar contenido (solo permite borrar).

### `GestorPlantillas.tsx`
- `GestorPlantillas`: CRUD completo de plantillas locales.
- `SelectorPlantilla`: dropdown ligero exportado para uso en `/generar`.

---

## 8. Sistema de Diseño

### Paleta Tailwind Personalizada
- **`obsidian`** (50–950): grises fríos. `obsidian-950` = `#09090b` (bg dark, texto light).
- **`sapphire`** (50–950): azules. `sapphire-600` = `#2563eb` (primario light), `sapphire-500` = `#3b82f6` (primario dark).

### CSS Variables
```css
:root  { --background: #fafafa; --foreground: #09090b; --primary: #2563eb; --border: #e2e8f0; }
.dark  { --background: #09090b; --foreground: #f8fafc; --primary: #3b82f6; --border: #1e293b; }
```

### Utilidades Globales
- **`glass-card`**: glassmorphism (`bg-white/70 backdrop-blur-xl border border-white/20 shadow-soft`).
- **`bg-noise`**: textura SVG fractal inline.
- **`shadow-soft`**, **`shadow-float`**, **`shadow-inner-soft`**: sombras custom.
- **`animate-fade-in`**, **`animate-scale-in`**: animaciones CSS para modales.

### Tipografía
- **Outfit** (Google Fonts) cargada en `app/layout.tsx`.

---

## 9. Numeración de Comprobantes (CF Number)

```typescript
// lib/generatorCF.ts
export async function getNextCFNumber(perfilId: string): Promise<string>
```
- Consulta el último registro por `cf_number DESC`, incrementa y formatea `CF-XXXX` (4 dígitos con padding).
- Fallback a `CF-0001` si está vacío o hay error.
- **Limitación**: No atómico. En uso concurrente podría repetirse. Aceptado en MVP.

---

## 10. SEO y Metadata

- **JSON-LD**: Schema.org `SoftwareApplication` en la landing.
- **Open Graph** + **Twitter Cards** en `app/layout.tsx`.
- **`sitemap.ts`** y **`robots.ts`** generados dinámicamente por Next.js.
- **Accesibilidad**: skip-link, `aria-label`, `aria-hidden`, `lang="es"`.
- **Google Search Console**: token placeholder pendiente de configurar.

---

## 11. Variables de Entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase (JWT) |

> Ambas son `NEXT_PUBLIC_` (expuestas al cliente). La seguridad recae enteramente en las políticas RLS de Supabase.

---

## 12. Etapa de Desarrollo y Estado Actual

### Estado: MVP Funcional
El sistema está completamente operativo para el caso de uso central.

### Completado ✅
- [x] Autenticación completa (login, registro, recuperación, restablecimiento)
- [x] Dashboard con historial, stats y búsqueda
- [x] Generación de comprobantes Recepción y Entrega
- [x] Preview A4 en tiempo real escalado responsive
- [x] Exportación a PDF (html2pdf.js) e impresión
- [x] Verificación pública por QR (`/v/[id]`)
- [x] Configuración del negocio (nombre, logo, color, plantillas, RRSS)
- [x] Gestor de plantillas de texto (localStorage)
- [x] Selector de plantillas desde el formulario
- [x] Modo claro/oscuro
- [x] RLS completo en Supabase
- [x] Subida de logo a Supabase Storage
- [x] Cambio de contraseña
- [x] Exportación de datos a CSV
- [x] Numeración correlativa automática CF-XXXX

### Deuda Técnica Conocida ⚠️
- **Middleware desactivado**: protección de rutas solo client-side.
- **Eliminación de cuenta**: usa `supabase.auth.admin.deleteUser()` que requiere `service_role` key — no funciona desde el cliente. Necesita una API Route de Next.js.
- **CF Number no atómico**: posible duplicado en uso concurrente (improbable en este modelo).
- **Plantillas en localStorage**: no sincronizadas con la nube, se pierden si se cambia de dispositivo.
- **`react-quill` deprecated**: librería descontinuada. Migrar a `@veltop/react-quill` o Tiptap.
- **Tipos `any`**: `ConfiguracionPage` usa `useState<any>` para el perfil en lugar de `PerfilNegocio`.
- **Campos no tipados**: `instagram_user`, `facebook_user`, `mensaje_whatsapp_predeterminado` no están en el tipo `PerfilNegocio` de `lib/supabase.ts`.

### Roadmap Sugerido 🔜
- [ ] Sincronizar plantillas con Supabase (migrar de localStorage)
- [ ] API Route para eliminación segura de cuenta
- [ ] Envío de WhatsApp con link del comprobante
- [ ] Filtros y paginación del historial
- [ ] Plan freemium / límite mensual de comprobantes
- [ ] Dashboard analítico con gráficos

---

## 13. Convenciones y Decisiones de Diseño

### Arquitectónicas
1. **Client Components primero**: Todas las páginas usan `"use client"`. No se aprovecha RSC para lógica de datos.
2. **Sin API Routes propias**: Toda la lógica de datos va directo a Supabase desde el cliente.
3. **Supabase Anon Key + RLS**: Modelo de seguridad 100% basado en políticas RLS.
4. **Single user per account**: Una cuenta Supabase Auth = un negocio = un perfil. Sin roles ni multi-usuario.
5. **PDF del DOM**: Comprobante es HTML/CSS capturado como imagen por html2pdf.js → jsPDF.

### De Código
- Componentes en PascalCase.
- Estilos Tailwind inline; `glass-card` es la única utility custom reutilizable.
- Imports: React → Next.js → Supabase → componentes locales → tipos → iconos.
- Estado de formulario: múltiples `useState` separados por campo.

---

## 14. Cómo Correr el Proyecto

```bash
pnpm install   # Instalar dependencias
pnpm dev       # Dev server → http://localhost:3000
pnpm build     # Build de producción
pnpm start     # Servidor de producción
```

**SQL requerido en Supabase (en orden):**
1. `schema.sql` — tablas, índices, RLS, trigger.
2. `security_hardening.sql` — políticas de lectura pública para QR.

---

## 15. Flujo de Datos (Resumen)

```
[/generar] → supabase.insert(garantias_emitidas) → shareUrl = /v/{id}
                                                 → supabase.update(perfiles_negocio.plantilla)
                                                 → html2pdf.js → PDF
                                                 → window.print() → Sistema OS

[/v/{id}]  → supabase.select(garantias_emitidas WHERE id = uuid)
           → supabase.select(perfiles_negocio WHERE id = perfil_id)
           → ComprobantePDF (read-only)

[localStorage] → GestorPlantillas (CRUD) → SelectorPlantilla → EditorPlantilla
```
