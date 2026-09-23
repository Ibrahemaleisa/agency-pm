import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { ar as arLocale, enUS } from "date-fns/locale";
import { DICT, LANG_COOKIE, dirOf, isLang, type Lang } from "./i18n";
import { APP_DICT } from "./i18n-app";

/** Visitor's chosen language (Arabic by default). */
export const getLang = cache(async (): Promise<Lang> => {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "ar";
});

/** Public-site copy (landing + sign-in). */
export async function getDict() {
  const lang = await getLang();
  return { lang, t: DICT[lang] };
}

/** In-app copy, date locale and text direction for the current request. */
export const getT = cache(async () => {
  const lang = await getLang();
  return { lang, t: APP_DICT[lang], locale: lang === "ar" ? arLocale : enUS, dir: dirOf(lang) };
});
