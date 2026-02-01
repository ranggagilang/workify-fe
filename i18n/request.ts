import { getRequestConfig } from "next-intl/server";

// 🔥 DATA BAHASA LANGSUNG DI DALAM KODE (ANTI ERROR __DIRNAME)
const messagesData: Record<string, any> = {
  id: {
    "homepage": {
      "title": "cmlabs Next.js Boilerplate",
      "description": "Boilerplate untuk proyek Next.js dengan TypeScript, Tailwind CSS, dan banyak lagi."
    }
  },
  en: {
    "homepage": {
      "title": "cmlabs Next.js Boilerplate",
      "description": "A boilerplate for Next.js projects with TypeScript, Tailwind CSS, and more."
    }
  }
};

export default getRequestConfig(async (params: any) => {
  // Ambil locale dari params
  const locale = await params.locale;
  
  // Gunakan 'id' jika locale tidak ditemukan
  const activeLocale = messagesData[locale] ? locale : 'id';

  return {
    locale: activeLocale,
    messages: messagesData[activeLocale]
  };
});