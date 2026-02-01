import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from "next-intl/middleware";

// 🔥 SOLUSI: Jangan import { routing }. Tulis konfigurasi secara manual di sini.
// Ini mencegah Middleware memanggil file i18n/routing.ts yang merusak sistem di Vercel.
const intlMiddleware = createMiddleware({
  // Daftar bahasa yang kamu gunakan (sesuaikan dengan isi folder messages kamu)
  locales: ['en', 'id'],
  // Bahasa utama aplikasi
  defaultLocale: 'id',
  // Sembunyikan prefix bahasa jika menggunakan default (opsional)
  localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
  // 1. Ambil pathname (contoh: / atau /login)
  const { pathname } = request.nextUrl;

  // 2. Redirect root ke login (Sesuai keinginanmu)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Jalankan middleware internasionalisasi
  return intlMiddleware(request);
}

export const config = {
  // Gunakan matcher yang lebih sederhana untuk memastikan tidak ada rute internal yang terganggu
  matcher: [
    // Jalankan pada semua rute kecuali yang bersifat teknis
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};