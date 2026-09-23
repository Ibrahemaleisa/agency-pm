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
  Users,
  X,
} from "lucide-react";
import { cn } from "./ui";
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
};

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  section?: string;
  badge?: number;
};

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
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount(initialUnread);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
      {items.map((item, i) => {
        const Icon = ICONS[item.icon];
        const showSection = item.section && item.section !== items[i - 1]?.section;
        const badge = item.icon === "notifications" ? unread : item.badge;
        return (
          <div key={item.href}>
            {showSection && (
              <div className="mt-4 mb-1 px-2 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                {item.section}
              </div>
            )}
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition",
                isActive(item.href)
                  ? "bg-zinc-900/[0.06] text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-900/[0.04] hover:text-zinc-900",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {!!badge && (
                <span className="rounded-full bg-indigo-600 px-1.5 py-px text-[10px] font-semibold text-white tabular-nums">
                  {badge}
                </span>
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-zinc-200 p-3">
      <div className="flex items-center gap-2 px-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{user.name}</div>
          <div className="truncate text-xs text-zinc-500">{user.roleLabel}</div>
        </div>
        <form action={logoutAction}>
          <button
            title="Sign out"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );

  const brand = (
    <div className="flex h-14 items-center gap-2 px-5">
      <div className="flex size-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
        {orgName[0]}
      </div>
      <span className="truncate text-sm font-semibold">{orgName}</span>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-zinc-200 bg-white px-3 md:hidden">
        <button onClick={() => setOpen(true)} className="rounded-md p-1.5 hover:bg-zinc-100" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <span className="text-sm font-semibold">{orgName}</span>
        <Link href="/notifications" className="relative rounded-md p-1.5 hover:bg-zinc-100" aria-label="Notifications">
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-indigo-600" />}
        </Link>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-zinc-900/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 rounded-md p-1 hover:bg-zinc-100" aria-label="Close menu">
              <X className="size-4" />
            </button>
            {brand}
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-zinc-200 bg-white md:flex">
        {brand}
        {nav}
        {footer}
      </aside>
    </>
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
