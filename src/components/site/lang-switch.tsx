import type { Lang } from "@/lib/i18n";
import { cn } from "../ui";

/** AR | EN segmented toggle. Plain links (full reload) so text direction flips everywhere. */
export function LangSwitch({ lang, next, className }: { lang: Lang; next: string; className?: string }) {
  const options: { value: Lang; label: string; title: string }[] = [
    { value: "ar", label: "AR", title: "العربية" },
    { value: "en", label: "EN", title: "English" },
  ];
  return (
    <div
      dir="ltr"
      role="group"
      aria-label="Language"
      className={cn("flex items-center rounded-full border border-white/15 bg-white/5 p-0.5 text-xs font-semibold", className)}
    >
      {options.map((o) =>
        o.value === lang ? (
          <span key={o.value} aria-current="true" title={o.title} className="rounded-full bg-sand-200 px-3 py-1.5 text-ink">
            {o.label}
          </span>
        ) : (
          <a
            key={o.value}
            href={`/lang?to=${o.value}&next=${encodeURIComponent(next)}`}
            hrefLang={o.value}
            title={o.title}
            className="rounded-full px-3 py-1.5 text-zinc-400 transition hover:text-white"
          >
            {o.label}
          </a>
        ),
      )}
    </div>
  );
}
