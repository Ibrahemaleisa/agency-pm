import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fada | فضاء", template: "%s · Fada" },
  description: "Fada — creative content & marketing agency",
};

export const viewport: Viewport = {
  themeColor: "#05050a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full text-zinc-900">{children}</body>
    </html>
  );
}
