import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["id", "en"], // Tulis manual di sini
  defaultLocale: "id",
  localePrefix: "as-needed" // Menjaga URL tetap bersih tanpa /id/
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);