import { cn } from "../ui";

const EYE = "M150 231C215 231 268 300 267 372C266 405 255 425 225 426C150 428 68 395 68 322C68 270 105 231 150 231Z";
const BODY =
  "M0 150C0 67 67 0 150 0L492 0C575 0 642 67 642 150L642 876C642 902 614 916 592 900L405 757C360 722 282 722 237 757L50 900C28 916 0 902 0 876Z";

/** Colours per background so the mark never disappears. */
const VARIANTS = {
  /** Original: black mask, white eyes — for light backgrounds. */
  light: { body: "#0a0a0a", eye: "#ffffff", shade: "#d1d1d1" },
  /** Beige mask, dark eyes — for black backgrounds. */
  dark: { body: "#e8dcc8", eye: "#0a0a0a", shade: "#2e2c29" },
} as const;

/**
 * Fada mask mark.
 * `uid` keeps clip-path ids unique when several marks render on one page.
 */
export function FadaMark({
  className,
  uid = "fm",
  label,
  variant = "dark",
}: {
  className?: string;
  uid?: string;
  label?: string;
  variant?: keyof typeof VARIANTS;
}) {
  const c = VARIANTS[variant];
  const clip = `${uid}-eye`;
  const eye = (
    <>
      <path d={EYE} fill={c.shade} />
      <path clipPath={`url(#${clip})`} d="M140 222C133 300 140 380 255 428L300 428L300 222Z" fill={c.eye} />
    </>
  );
  return (
    <svg
      viewBox="0 0 642 908"
      className={cn("h-9 w-auto shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={clip}>
          <path d={EYE} />
        </clipPath>
      </defs>
      <path d={BODY} fill={c.body} />
      {eye}
      <g transform="translate(642 0) scale(-1 1)">{eye}</g>
    </svg>
  );
}

export function FadaLogo({ lang, className, uid }: { lang: "ar" | "en"; className?: string; uid?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <FadaMark uid={uid} className="h-8" />
      <span className="font-display text-xl font-semibold tracking-tight text-white">{lang === "ar" ? "فضاء" : "Fada"}</span>
    </span>
  );
}
