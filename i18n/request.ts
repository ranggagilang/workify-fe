import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async (params: any) => {
  // Pastikan ambil locale dengan aman
  const locale = await params.locale;
  
  // Gunakan fallback jika locale tidak terdeteksi
  const activeLocale = routing.locales.includes(locale as any) 
    ? locale 
    : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`../dictionaries/homepage/${activeLocale}.json`)).default
  };
});