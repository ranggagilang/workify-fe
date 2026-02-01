import LanguageSwitcher from "@/components/ui/language-switcher";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Page() {
  const t = useTranslations("homepage");

  return (
    <div className="text-center flex flex-col items-center justify-center gap-8 py-16 min-h-screen">
      <Image
        src="https://cmlabs-co.s3.ap-southeast-1.amazonaws.com/email/new-logo-default.png"
        alt="Logo"
        width={100}
        height={100}
        className="rounded-md"
      />

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        {t("title")}
      </h1>

      <p className="max-w-2xl text-lg text-muted-foreground">
        {t("description")}
      </p>

      <LanguageSwitcher />
    </div>
  );
}
