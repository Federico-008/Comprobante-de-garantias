import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: {
    default: 'GarantiaPro | Comprobantes de Garantía Digital',
    template: '%s | GarantiaPro'
  },
  description: 'Sistema profesional para la creación y gestión de garantías digitales. Envía comprobantes por WhatsApp en segundos.',
  keywords: ['garantía digital', 'generador de comprobantes', 'servicio técnico', 'gestión de garantías', 'SaaS'],
  authors: [{ name: 'Guillermo Federico Ramirez' }],
  creator: 'Guillermo Federico Ramirez',
  publisher: 'GarantiaPro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'GarantiaPro | Garantías Digitales Profesionales',
    description: 'Optimiza tu negocio con comprobantes digitales verificables por QR.',
    url: 'https://garantiapro.vercel.app',
    siteName: 'GarantiaPro',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GarantiaPro | Comprobantes de Garantía Digital',
    description: 'Sistema profesional para la creación y gestión de garantías digitales. Envía comprobantes por WhatsApp en segundos.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'ingresa-tu-codigo-de-google-search-console-aqui', // Reemplazar con el token real de Google
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased min-h-screen relative`}>
        <div className="fixed inset-0 pointer-events-none z-0 bg-noise opacity-[0.25] mix-blend-overlay dark:opacity-[0.15]"></div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
