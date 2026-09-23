import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Clapperboard,
  Handshake,
  Languages,
  Mail,
  Megaphone,
  MessageCircle,
  PenTool,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/lang";
import { SITE } from "@/lib/site";
import { FadaLogo, FadaMark } from "@/components/site/brand";
import { Reveal } from "@/components/site/reveal";
import { LeadForm } from "@/components/site/lead-form";
import { cn } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getDict();
  return {
    title: { absolute: `${SITE.name[lang]} · ${t.footer.tagline}` },
    description: t.hero.sub,
  };
}

const SERVICE_ICONS = { content: PenTool, production: Clapperboard, paid: Megaphone, account: Handshake } as const;

export default async function LandingPage() {
  const [{ lang, t }, user] = await Promise.all([getDict(), getCurrentUser()]);
  const other = lang === "ar" ? "en" : "ar";
  const portalHref = user ? "/" : "/login";
  const portalLabel = user ? t.nav.dashboard : t.nav.login;
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="relative overflow-x-clip">
      {/* ---------------- Header ---------------- */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[#05050a]/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:h-20 md:px-8">
          <Link href={user ? "/welcome" : "/"} aria-label={SITE.name[lang]}>
            <FadaLogo lang={lang} uid="fm-header" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 lg:flex">
            {(["services", "journey", "portal", "clients", "contact"] as const).map((id) => (
              <a key={id} href={`#${id}`} className="transition hover:text-white">
                {t.nav[id]}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={`/lang?to=${other}&next=${user ? "/welcome" : "/"}`}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              <Languages className="size-4" />
              <span>{t.nav.switchTo}</span>
            </a>
            <Link
              href={portalHref}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-white/10 transition hover:bg-indigo-100"
            >
              {portalLabel}
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16">
        <div className="starfield starfield-slow pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute top-1/4 -end-40 size-[640px] rounded-full bg-indigo-600/25 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 -start-20 size-[520px] rounded-full bg-violet-700/20 blur-[120px]" />
        <span className="animate-meteor pointer-events-none absolute top-24 end-[10%] h-px w-40 bg-gradient-to-l from-transparent via-white to-transparent" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-indigo-200 md:text-sm">
                <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
                {t.hero.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="font-display mt-6 text-5xl leading-[1.15] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {t.hero.title1}
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-200 bg-clip-text text-transparent">
                  {t.hero.title2}
                </span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">{t.hero.sub}</p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3.5 font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:shadow-indigo-500/50"
                >
                  {t.hero.primary}
                  <Arrow className="size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </a>
                <Link
                  href={portalHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-white backdrop-blur transition hover:border-white/30 hover:bg-white/10"
                >
                  {user ? t.nav.dashboard : t.hero.secondary}
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Planet + orbits */}
          <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none" aria-hidden="true">
            <div className="animate-float absolute inset-0">
              <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_30%_30%,#c7d2fe_0%,#7c3aed_35%,#312e81_70%,#0b0b1f_100%)] shadow-[0_0_120px_-10px_rgba(124,58,237,0.7),inset_-30px_-40px_80px_rgba(0,0,0,0.6)]" />
              <div className="animate-orbit absolute inset-[4%] rounded-full border border-white/10">
                <span className="absolute top-1/2 -start-1.5 size-3 rounded-full bg-cyan-300 shadow-[0_0_20px_4px_rgba(103,232,249,0.6)]" />
              </div>
              <div className="animate-orbit-fast absolute inset-[-6%] rounded-full border border-dashed border-white/[0.07] [animation-direction:reverse]">
                <span className="absolute -top-1 start-1/2 size-2 rounded-full bg-violet-300 shadow-[0_0_14px_3px_rgba(196,181,253,0.6)]" />
              </div>
              <div className="absolute inset-x-[-4%] top-1/2 h-[26%] -translate-y-1/2 -rotate-[18deg] rounded-[50%] border-2 border-indigo-200/30" />
            </div>
          </div>
        </div>

        <a href="#about" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-zinc-500 md:flex">
          {t.hero.scroll}
          <span className="h-10 w-px bg-gradient-to-b from-zinc-500 to-transparent" />
        </a>
      </section>

      {/* ---------------- About ---------------- */}
      <section id="about" className="relative scroll-mt-20 py-24 md:py-36">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal>
            <SectionLabel>{t.about.label}</SectionLabel>
            <h2 className="font-display mt-5 text-3xl leading-snug font-semibold text-white md:text-5xl md:leading-tight">
              {t.about.title}
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-zinc-400 md:text-xl">{t.about.body}</p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Meteor vs Orbit ---------------- */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="text-center">
            <SectionLabel center>{t.contrast.label}</SectionLabel>
            <h2 className="font-display mt-5 text-3xl font-semibold text-white md:text-5xl">{t.contrast.title}</h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="relative h-full overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-10">
                <div className="relative h-40">
                  <span className="animate-meteor absolute top-4 end-4 h-0.5 w-48 bg-gradient-to-l from-transparent via-orange-200 to-transparent" />
                  <span className="absolute top-10 end-24 size-1 rounded-full bg-zinc-600" />
                  <span className="absolute top-24 end-10 size-1 rounded-full bg-zinc-700" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-zinc-300">{t.contrast.meteorTitle}</h3>
                <p className="mt-3 leading-relaxed text-zinc-500">{t.contrast.meteorText}</p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="relative h-full overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-8 md:p-10">
                <div className="relative mx-auto h-40 w-40" aria-hidden="true">
                  <span className="absolute inset-[30%] rounded-full bg-gradient-to-br from-indigo-300 to-violet-600 shadow-[0_0_40px_rgba(124,58,237,0.6)]" />
                  <span className="animate-orbit absolute inset-0 rounded-full border border-indigo-300/30">
                    <span className="absolute top-1/2 -start-1 size-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-white">{t.contrast.orbitTitle}</h3>
                <p className="mt-3 leading-relaxed text-zinc-300">{t.contrast.orbitText}</p>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-12 text-center">
            <p className="font-display bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-2xl font-semibold text-transparent md:text-3xl">
              {t.contrast.tagline}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section id="services" className="relative scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <SectionLabel>{t.services.label}</SectionLabel>
            <h2 className="font-display mt-5 max-w-2xl text-3xl font-semibold text-white md:text-5xl md:leading-tight">
              {t.services.title}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.services.items.map((s, i) => {
              const Icon = SERVICE_ICONS[s.key as keyof typeof SERVICE_ICONS];
              return (
                <Reveal key={s.key} delay={i * 100}>
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-7 transition duration-500 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05]">
                    <div className="pointer-events-none absolute -top-16 -end-16 size-40 rounded-full bg-indigo-500/0 blur-3xl transition duration-500 group-hover:bg-indigo-500/20" />
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 ring-1 ring-white/10">
                      <Icon className="size-5 text-indigo-200" />
                    </span>
                    <h3 className="font-display mt-6 text-xl font-semibold text-white">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{s.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Journey ---------------- */}
      <section id="journey" className="relative scroll-mt-20 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-96 -translate-y-1/2 bg-gradient-to-r from-transparent via-indigo-900/15 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="text-center">
            <SectionLabel center>{t.journey.label}</SectionLabel>
            <h2 className="font-display mt-5 text-3xl font-semibold text-white md:text-5xl">{t.journey.title}</h2>
          </Reveal>
          <ol className="relative mt-16 grid gap-6 md:grid-cols-5 md:gap-4">
            <span className="pointer-events-none absolute top-7 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-indigo-500/0 via-indigo-400/40 to-indigo-500/0 md:block" />
            {t.journey.steps.map((step, i) => {
              const highlight = i === 3; // "Your approval" — the client's moment in the journey
              return (
                <li key={step.title}>
                  <Reveal delay={i * 120} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                    <span
                      className={cn(
                        "font-display relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border text-lg font-semibold",
                        highlight
                          ? "border-cyan-300/50 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.6)]"
                          : "border-white/10 bg-[#0b0b16] text-indigo-200",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white md:mt-5">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---------------- Portal showcase ---------------- */}
      <section id="portal" className="relative scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>{t.portal.label}</SectionLabel>
            <h2 className="font-display mt-5 text-3xl font-semibold text-white md:text-5xl md:leading-tight">{t.portal.title}</h2>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">{t.portal.body}</p>
            <ul className="mt-8 space-y-4">
              {t.portal.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-zinc-200">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/30">
                    <Check className="size-4 text-emerald-300" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={portalHref}
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-zinc-950 transition hover:bg-indigo-100"
            >
              {user ? t.nav.dashboard : t.portal.cta}
              <Arrow className="size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </Reveal>
          <Reveal delay={150}>
            <PortalMock t={t.portal.mock} />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Clients ---------------- */}
      <section id="clients" className="relative scroll-mt-20 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="text-center">
            <SectionLabel center>{t.clients.label}</SectionLabel>
            <h2 className="font-display mt-5 text-3xl font-semibold text-white md:text-4xl">{t.clients.title}</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/5 bg-white/5 sm:grid-cols-3 lg:grid-cols-5">
              {SITE.clients.map((c) => (
                <div key={c} className="flex h-28 items-center justify-center bg-[#07070e] px-4 text-center transition hover:bg-[#0c0c18]">
                  <span className="font-display text-base font-semibold tracking-tight text-zinc-500 transition hover:text-zinc-200" dir="ltr">
                    {c}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Contact / CTA ---------------- */}
      <section id="contact" className="relative scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-950/60 via-[#0b0b18] to-violet-950/40 p-6 md:p-14">
            <div className="starfield pointer-events-none absolute inset-0 opacity-40" />
            <div className="pointer-events-none absolute -top-32 -end-32 size-96 rounded-full bg-indigo-600/25 blur-3xl" />
            <div className="relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <SectionLabel>{t.contact.label}</SectionLabel>
                <h2 className="font-display mt-5 text-4xl font-bold text-white md:text-6xl">{t.contact.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-zinc-300">{t.contact.body}</p>
                <div className="mt-8 space-y-3">
                  {SITE.whatsapp && (
                    <a
                      href={`https://wa.me/${SITE.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                    >
                      <MessageCircle className="size-5" /> {t.contact.whatsapp}
                    </a>
                  )}
                  {SITE.email && (
                    <p className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                      <Mail className="size-4" /> {t.contact.orEmail}
                      <a href={`mailto:${SITE.email}`} className="font-medium text-indigo-200 hover:text-white" dir="ltr">
                        {SITE.email}
                      </a>
                    </p>
                  )}
                </div>
              </Reveal>
              <Reveal delay={150}>
                <LeadForm t={t.contact} services={t.services.items} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <FadaLogo lang={lang} uid="fm-footer" />
            <p className="mt-3 text-sm text-zinc-500">{t.footer.tagline}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
            {(["services", "journey", "portal", "contact"] as const).map((id) => (
              <a key={id} href={`#${id}`} className="hover:text-white">
                {t.nav[id]}
              </a>
            ))}
            <Link href={portalHref} className="hover:text-white">
              {portalLabel}
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            {Object.entries(SITE.social)
              .filter(([, url]) => url)
              .map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noreferrer" className="capitalize hover:text-white">
                  {name}
                </a>
              ))}
            <span>
              © {new Date().getFullYear()} {SITE.name[lang]} · {t.footer.rights}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-sm font-medium tracking-wide text-indigo-300", center && "justify-center")}>
      <span className="h-px w-8 bg-gradient-to-r from-indigo-400 to-transparent rtl:bg-gradient-to-l" />
      {children}
    </span>
  );
}

/** Stylised preview of the client portal (pure HTML, no screenshot). */
function PortalMock({ t }: { t: { project: string; progress: string; awaiting: string; item: string; approve: string; changes: string; stages: string[] } }) {
  return (
    <div className="relative" aria-hidden="true">
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-600/30 to-violet-600/10 blur-2xl" />
      <div className="relative rounded-3xl border border-white/10 bg-[#0c0c16]/90 p-5 shadow-2xl backdrop-blur md:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FadaMark className="size-8" uid="fm-mock" />
            <div>
              <div className="font-display font-semibold text-white">{t.project}</div>
              <div className="text-xs text-zinc-500">Bloom Café</div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-300" /> Active
          </span>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-zinc-400">{t.progress}</span>
            <span className="font-semibold text-white">68%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-300 rtl:bg-gradient-to-l" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {t.stages.map((s, i) => (
              <div key={s} className="text-center">
                <div className={cn("h-1 rounded-full", i < 2 ? "bg-emerald-400" : i === 2 ? "bg-indigo-400" : "bg-white/10")} />
                <div className={cn("mt-2 text-[11px]", i === 2 ? "font-semibold text-white" : "text-zinc-500")}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-400/10 to-orange-500/5 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-200">
            <BadgeCheck className="size-4" /> {t.awaiting}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid size-12 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-lg">
              <span className="bg-gradient-to-br from-orange-300 to-rose-400" />
              <span className="bg-gradient-to-br from-amber-200 to-orange-400" />
              <span className="bg-gradient-to-br from-rose-300 to-fuchsia-400" />
              <span className="bg-gradient-to-br from-yellow-200 to-amber-400" />
            </div>
            <div className="min-w-0 flex-1 text-sm font-medium text-white">{t.item}</div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="flex-1 rounded-xl bg-emerald-500 py-2 text-center text-sm font-semibold text-white">{t.approve}</span>
            <span className="flex-1 rounded-xl border border-white/10 py-2 text-center text-sm text-zinc-300">{t.changes}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
