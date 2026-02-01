import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // 🔥 Tulis langsung di sini, jangan ambil dari @/lib/locales
  locales: ["id", "en"],

  // Gunakan bahasa Indonesia sebagai default
  defaultLocale: "id",

  // ✅ Tambahkan ini agar URL kamu tetap bersih (tanpa /id/ di depan)
  localePrefix: "as-needed"
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);