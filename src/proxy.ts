import { NextResponse, type NextRequest } from "next/server";

/** Cheap gate: bounce requests without a session cookie to /login. Full validation happens server-side. */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("apm_session");
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
