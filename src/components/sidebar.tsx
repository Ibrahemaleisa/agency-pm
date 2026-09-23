"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Bell,
  Building2,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { cn } from "./ui";
import { FadaMark } from "./site/brand";
import { logoutAction } from "@/server/auth-actions";

const ICONS = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  tasks: CheckSquare,
  approvals: BadgeCheck,
  clients: Building2,
  activity: Activity,
  notifications: Bell,
  team: Users,
  templates: LayoutTemplate,
  leads: Sparkles,
};

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  section?: string;
  badge?: number;
};

/** Items shown in the phone bottom bar (in this order), when the user has them. */
const MOBILE_TABS: NavItem["icon"][] = ["dashboard", "projects", "tasks", "approvals", "notifications"];

export function Sidebar({
  items,
  user,
  orgName,
  initialUnread,
}: {
  items: NavItem[];
  user: { name: string; roleLabel: string };
  orgName: string;
  initialUnread: number;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const unread = useUnreadCount(initialUnread);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const badgeFor = (item: NavItem) => (item.icon === "notifications" ? unread : item.badge);

  const tabs = MOBILE_TABS.map((icon) => items.find((i) => i.icon === icon)).filter(Boolean).slice(0, 4) as NavItem[];
  const rest = items.filter((i) => !tabs.includes(i));

  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <>
      {/* ---------------- Desktop sidebar ---------------- */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-zinc-950 text-zinc-300 md:flex">
        <Brand orgName={orgName} />
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
          {items.map((item, i) => {
            const Icon = ICONS[item.icon];
            const showSection = item.section && item.section !== items[i - 1]?.section;
            const badge = badgeFor(item);
            const active = isActive(item.href);
            return (
              <div key={item.href}>
                {showSection && (
                  <div className="mt-5 mb-1.5 px-3 text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-indigo-400" />}
                  <Icon className={cn("size-4 shrink-0", active ? "text-indigo-300" : "text-zinc-500 group-hover:text-zinc-300")} />
                  <span className="flex-1">{item.label}</span>
                  {!!badge && (
                    <span className="rounded-full bg-indigo-500 px-1.5 py-px text-[10px] font-semibold text-white tabular-nums">
                      {badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{user.name}</div>
              <div className="truncate text-xs text-zinc-500">{user.roleLabel}</div>
            </div>
            <form action={logoutAction}>
              <button title="Sign out" className="rounded-md p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ---------------- Mobile top bar ---------------- */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/85 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <Logo orgName={orgName} uid="fm-mobile" />
          <span className="text-[15px] font-semibold">{orgName}</span>
        </div>
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-semibold text-white">
          {initials}
        </span>
      </header>

      {/* ---------------- Mobile bottom tab bar ---------------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/80 bg-white/90 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
          {tabs.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActive(item.href);
            const badge = badgeFor(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                  active ? "text-indigo-600" : "text-zinc-500",
                )}
              >
                <span className="relative">
                  <Icon className="size-6" strokeWidth={active ? 2.2 : 1.8} />
                  {!!badge && (
                    <span className="absolute -top-1 -right-2 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] leading-4 font-semibold text-white">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>
                {item.label === "Notifications" ? "Alerts" : item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              rest.some((i) => isActive(i.href)) ? "text-indigo-600" : "text-zinc-500",
            )}
          >
            <Menu className="size-6" strokeWidth={1.8} />
            More
          </button>
        </div>
      </nav>

      {/* ---------------- Mobile "More" sheet ---------------- */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]" onClick={() => setMoreOpen(false)} />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 shadow-2xl"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200" />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-zinc-500">{user.roleLabel}</div>
              </div>
              <button onClick={() => setMoreOpen(false)} className="rounded-full p-2 hover:bg-zinc-100" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {rest.map((item) => {
                const Icon = ICONS[item.icon];
                const badge = badgeFor(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium",
                      isActive(item.href) ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-700",
                    )}
                  >
                    <Icon className="size-5" />
                    {item.label}
                    {!!badge && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <form action={logoutAction} className="contents">
                <button className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 px-2 py-3 text-xs font-medium text-red-600">
                  <LogOut className="size-5" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Logo({ orgName, uid }: { orgName: string; uid: string }) {
  return <FadaMark className="size-8" uid={uid} label={orgName} />;
}

function Brand({ orgName }: { orgName: string }) {
  return (
    <div className="flex h-16 items-center gap-3 px-5">
      <Logo orgName={orgName} uid="fm-desktop" />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white">{orgName}</div>
        <div className="text-[11px] text-zinc-500">Workspace</div>
      </div>
    </div>
  );
}

/** Poll unread notification count so the badge stays fresh without full page refreshes. */
function useUnreadCount(initial: number) {
  const [count, setCount] = useState(initial);
  // Reset to the server value whenever a fresh render provides one.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setCount(initial);
  }
  useEffect(() => {
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/notifications/count", { cache: "no-store" });
        if (res.ok) setCount((await res.json()).unread);
      } catch {}
    };
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, []);
  return count;
}
