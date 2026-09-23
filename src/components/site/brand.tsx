import { cn } from "../ui";

/**
 * Fada mark: a planet with an orbit ring and a satellite.
 * `uid` keeps gradient ids unique when several marks render on one page.
 */
export function FadaMark({ className, uid = "fm", label }: { className?: string; uid?: string; label?: string }) {
  const planet = `${uid}-planet`;
  const ring = `${uid}-ring`;
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-9 shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={planet} x1="8" y1="8" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5b4fc" />
          <stop offset="0.55" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id={ring} x1="2" y1="20" x2="38" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67e8f9" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#c7d2fe" />
          <stop offset="1" stopColor="#c084fc" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="10" fill={`url(#${planet})`} />
      <ellipse cx="20" cy="20" rx="18" ry="6.5" fill="none" stroke={`url(#${ring})`} strokeWidth="1.6" transform="rotate(-24 20 20)" />
      <circle cx="35.2" cy="13.6" r="2" fill="#22d3ee" />
    </svg>
  );
}

export function FadaLogo({ lang, className, uid }: { lang: "ar" | "en"; className?: string; uid?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <FadaMark uid={uid} />
      <span className="font-display text-xl font-semibold tracking-tight text-white">{lang === "ar" ? "فضاء" : "Fada"}</span>
    </span>
  );
}
