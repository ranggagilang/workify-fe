import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "next-intl";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Import translation files from both homepage and contact folders
  const homepageMessages = (
    await import(`../dictionaries/homepage/${locale}.json`)
  ).default;

  // Merge the translations
  const messages = {
    ...homepageMessages,
  };

  return {
    messages,
    locale,
  };
});
