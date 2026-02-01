import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// 🔥 Berikan tipe 'any' atau 'any' asimetris pada params untuk menghilangkan merahnya
export default getRequestConfig(async (params: any) => {
  // Ambil locale dari params (support untuk versi Promise atau object biasa)
  const locale = await params.locale;
  
  // Pastikan locale yang diminta ada dalam daftar, jika tidak gunakan default
  const activeLocale = routing.locales.includes(locale as any) 
    ? locale 
    : routing.defaultLocale;

  // Import file JSON bahasa secara dinamis
  const homepageMessages = (
    await import(`../dictionaries/homepage/${activeLocale}.json`)
  ).default;

  return {
    locale: activeLocale,
    messages: {
      ...homepageMessages,
    },
  };
});