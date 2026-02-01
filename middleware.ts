import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from "next-intl/middleware";
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root otomatis ke login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  // Tangkap semua rute kecuali internal Next.js dan file statis
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};