import localFont from "next/font/local";

/**
 * Arabic brand font: Thmanyah Sans (licensed from https://font.thmanyah.com).
 * The license allows web use only when bundled into the product, so the repo stores encrypted
 * copies and `scripts/fonts.mjs decrypt` restores them before each build. Next.js then ships them
 * as hashed, bundled assets.
 */
const thmanyah = localFont({
  src: [
    { path: "../fonts/thmanyah/thmanyahsans-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/thmanyah/thmanyahsans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/thmanyah/thmanyahsans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/thmanyah/thmanyahsans-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/thmanyah/thmanyahsans-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-thmanyah",
  display: "swap",
  fallback: ["IBM Plex Sans Arabic", "system-ui", "sans-serif"],
});

export const arabicFontClass = thmanyah.variable;
