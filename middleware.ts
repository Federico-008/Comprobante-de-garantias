import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// aca se checkea la sesion
export function middleware(req: NextRequest) {
  // Nota: Desactivamos el redirect del middleware porque el cliente base de Supabase
  // usa localStorage y no cookies. Las páginas ya tienen su propio checkUser().
  return NextResponse.next();
}

// donde corre el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/generar/:path*', '/configuracion/:path*', '/plantillas/:path*'],
};
