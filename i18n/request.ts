import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// 🔥 STATIC IMPORT: Cara paling aman 100% untuk Vercel Edge
// Sesuaikan path ini dengan folder dictionaries kamu
import enMessages from "../dictionaries/homepage/en.json";
import idMessages from "../dictionaries/homepage/id.json";

export default getRequestConfig(async (params: any) => {
  const locale = await params.locale;
  
  const activeLocale = routing.locales.includes(locale as any) 
    ? locale 
    : routing.defaultLocale;

  // Pilih pesan berdasarkan locale tanpa 'await import' dinamis
  const messages = activeLocale === 'en' ? enMessages : idMessages;

  return {
    locale: activeLocale,
    messages
  };
});