import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from "next-intl/middleware";

// 🔥 PERBAIKAN: Jangan impor 'routing' dari file eksternal jika file tersebut 
// mengimpor modul dari @/lib/locales. Tulis konfigurasinya langsung di sini.
const intlMiddleware = createMiddleware({
  locales: ['en', 'id'], // Sesuaikan dengan bahasa yang kamu dukung
  defaultLocale: 'id'
});

export default function middleware(request: NextRequest) {
  // 1. Cek apakah pengguna mengunjungi halaman root ('/')
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jalankan middleware internasionalisasi
  return intlMiddleware(request);
}

export const config = {
  // Matcher tetap sama seperti milikmu
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*|login|register|admindashboard|information|attendance|permit_employee|schedule|salary|admin_setting|superadmindashboard|billing|pricing_management|company|activity_log|superadmin_setting|forgot_password|check_email|reset_password|link_expired|password_changed|add_employee|add_employee2|add_employee3|add_schedule|create_plan|change_password|employee_dashboard|employee_leaves|employee_attendance|employee_salary|employee_settings|employee_schedule).*)",
};