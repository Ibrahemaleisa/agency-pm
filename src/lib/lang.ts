import "server-only";
import { cookies } from "next/headers";
import { DICT, LANG_COOKIE, isLang, type Lang } from "./i18n";

/** Visitor's chosen language for public pages (Arabic by default). */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "ar";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: DICT[lang] };
}
