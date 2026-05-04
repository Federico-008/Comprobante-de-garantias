# Documentación Técnica: GarantiaPro

## Introducción
GarantiaPro es una solución integral diseñada para la gestión y emisión de comprobantes de garantía digitales. El sistema permite a negocios y técnicos formalizar la entrega de productos mediante documentos legales preconfigurados que pueden ser compartidos de forma instantánea y verificados mediante códigos QR.

## Arquitectura del Sistema
La aplicación utiliza una arquitectura moderna basada en la nube, optimizada para la velocidad y la seguridad de los datos.

### 1. Frontend y Aplicación
Se utiliza Next.js 14 como framework principal. La estructura de carpetas sigue el patrón de App Router de Next.js, lo que permite una navegación fluida y una carga optimizada por componentes.
- App Router: Gestión de rutas y estados del servidor.
- Components: Bloques reutilizables de UI (editores, visualizadores, selectores).
- Tailwind CSS: Framework de estilos para garantizar un diseño responsivo y soporte nativo de modo oscuro.

### 2. Backend y Base de Datos (Supabase)
El backend es gestionado por Supabase, proporcionando una infraestructura de Backend-as-a-Service (BaaS).
- Autenticación: Gestión de sesiones de usuario mediante JWT y persistencia en cliente.
- Base de Datos: PostgreSQL para el almacenamiento de perfiles de negocio y el historial de garantías.
- RLS (Row Level Security): Se implementaron políticas de firewall a nivel de base de datos para asegurar que los usuarios solo puedan acceder y modificar sus propios datos, permitiendo únicamente el acceso público de lectura a los comprobantes emitidos.

### 3. Generación de Documentos
Para la creación de los comprobantes se utiliza una combinación de HTML5 dinámico y la librería html2pdf.js. El sistema renderiza una previsualización exacta en formato A4 antes de la descarga, asegurando que el documento impreso sea idéntico a la versión digital.

## Tecnologías Utilizadas
- Framework: Next.js 14 (React 18).
- Base de Datos / Auth: Supabase (PostgreSQL).
- Estilos: Tailwind CSS.
- Iconografía: Lucide React.
- Tipografía: Inter (Next Font).
- Editor: React-Quill.
- PDF: html2pdf.js.

## Flujo de Uso Final

### 1. Configuración del Perfil
El usuario inicia sesión y accede a la sección de configuración. Aquí debe establecer el nombre de su negocio y subir su logotipo. Estos datos se inyectarán automáticamente en cada garantía emitida para dar una imagen profesional.

### 2. Gestión de Plantillas
En el apartado de plantillas, el técnico puede definir los términos legales, condiciones de cobertura y exclusiones. El editor permite el uso de variables dinámicas como {{nombre_cliente}} y {{numero_serie}}, que se reemplazan automáticamente al generar el documento.

### 3. Emisión de Garantía
Para emitir un comprobante, se completan los datos del cliente, el modelo del dispositivo y los días de cobertura. El sistema genera un número de control correlativo único. Una vez confirmados los datos, se guarda en la base de datos y se genera un enlace público.

### 4. Entrega y Verificación
El comprobante puede ser:
- Descargado en PDF para impresión.
- Enviado directamente por WhatsApp al cliente mediante un enlace único.
- Verificado en cualquier momento escaneando el código QR impreso en el documento, el cual redirige a la vista pública de validación.

## Utilidad y Propósito
La utilidad principal de este sistema es eliminar el uso de papel y centralizar el historial de ventas y garantías en un solo lugar. Proporciona seguridad jurídica tanto al vendedor como al comprador, permitiendo rastrear el vencimiento de cada equipo de forma visual mediante indicadores de estado en el panel principal.
