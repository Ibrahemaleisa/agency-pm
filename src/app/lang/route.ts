import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, isLang } from "@/lib/i18n";

/** GET /lang?to=en&next=/login — remember the visitor's language and go back. */
export function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get("to");
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  // Only allow same-site relative paths to avoid open redirects.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const res = NextResponse.redirect(new URL(safeNext, request.url));
  if (isLang(to)) {
    res.cookies.set(LANG_COOKIE, to, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}
