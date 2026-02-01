// middleware.ts (KODE BARU YANG SUDAH DIPERBAIKI)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// 1. Kita "bungkus" middleware i18n yang lama
const intlMiddleware = createMiddleware(routing);

// 2. Kita buat middleware utama yang baru
export default function middleware(request: NextRequest) {

  // 3. Cek apakah pengguna mengunjungi halaman root ('/')
  if (request.nextUrl.pathname === '/') {
    // 4. Jika ya, langsung arahkan ke halaman /login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 5. Jika tidak (misal ke '/id' atau '/en'), biarkan middleware i18n yang bekerja
  return intlMiddleware(request);
}

// 6. Blok 'config' ini tidak perlu diubah
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - ... dan semua halaman yang sudah kita kecualikan (login, register, dll)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*|login|register|admindashboard|information|attendance|permit_employee|schedule|salary|admin_setting|superadmindashboard|billing|pricing_management|company|activity_log|superadmin_setting|forgot_password|check_email|reset_password|link_expired|password_changed|add_employee|add_employee2|add_employee3|add_schedule|create_plan|change_password|employee_dashboard|employee_leaves|employee_attendance|employee_salary|employee_settings|employee_schedule).*)",
};