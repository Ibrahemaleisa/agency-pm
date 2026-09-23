import type { Metadata, Viewport } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import { arabicFontClass } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fada | فضاء", template: "%s · Fada" },
  description: "Fada — creative content & marketing agency",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${arabicFontClass} h-full antialiased`}>
      <body className="min-h-full text-zinc-900">{children}</body>
    </html>
  );
}
