import type { Metadata, Viewport } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import { arabicFontClass } from "./fonts";
import { getLang } from "@/lib/lang";
import { dirOf } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fada | فضاء", template: "%s · Fada" },
  description: "Fada — creative content & marketing agency",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={dirOf(lang)} className={`${arabicFontClass} h-full antialiased`}>
      <body className="min-h-full text-zinc-900">{children}</body>
    </html>
  );
}
