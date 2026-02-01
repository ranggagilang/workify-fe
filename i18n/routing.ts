import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // Tulis manual di sini, JANGAN import dari file luar
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "as-needed"
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);