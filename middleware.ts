import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_MAX_AGE, isLocale } from "@/lib/i18n/config";

// ?lang=ja (or en) on any page stores the language and reloads without the
// parameter. The counter's QR code uses it to hand its language to the phone.
export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  if (lang === null) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.searchParams.delete("lang");
  const response = NextResponse.redirect(url);
  if (isLocale(lang)) {
    response.cookies.set(LOCALE_COOKIE, lang, { path: "/", maxAge: LOCALE_MAX_AGE, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
