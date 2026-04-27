import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
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
    url: 'https://garantiapro.com',
    siteName: 'GarantiaPro',
    locale: 'es_ES',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
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
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
