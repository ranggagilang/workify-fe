import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Langsung arahkan halaman utama ke login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Lindungi rute standar, abaikan file statis
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};