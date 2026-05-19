import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/v/'],
      disallow: ['/dashboard', '/generar', '/login', '/registro', '/configuracion', '/api/'],
    },
    sitemap: `${typeof window !== 'undefined' ? window.location.origin : 'https://garantiapro.vercel.app'}/sitemap.xml`,
  };
}
