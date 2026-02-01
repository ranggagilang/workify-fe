import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async (params: any) => {
  const locale = await params.locale;
  const activeLocale = routing.locales.includes(locale as any) 
    ? locale 
    : routing.defaultLocale;

  // 🔥 Cara paling aman: Mapping manual tanpa template string dinamis yang kompleks
  let messages;
  if (activeLocale === 'en') {
    messages = (await import('../dictionaries/homepage/en.json')).default;
  } else {
    messages = (await import('../dictionaries/homepage/id.json')).default;
  }

  return {
    locale: activeLocale,
    messages
  };
});