import type { NavItem } from "@/components/sidebar";
import { can, type Permission } from "./permissions";
import type { Role } from "@/db/schema";

/** Sidebar entries, each gated by a permission (or visible to everyone when omitted). */
const NAV: (NavItem & { permission?: Permission })[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/projects", label: "Projects", icon: "projects" },
  { href: "/tasks", label: "Tasks", icon: "tasks", permission: "tasks.updateStatus" },
  { href: "/approvals", label: "Approvals", icon: "approvals" },
  { href: "/notifications", label: "Notifications", icon: "notifications" },
  { href: "/clients", label: "Clients", icon: "clients", permission: "clients.view", section: "Agency" },
  { href: "/leads", label: "Leads", icon: "leads", permission: "leads.manage", section: "Agency" },
  { href: "/activity", label: "Activity Log", icon: "activity", permission: "activity.viewAll", section: "Agency" },
  { href: "/team", label: "Team & Users", icon: "team", permission: "users.manage", section: "Settings" },
  { href: "/templates", label: "Module Templates", icon: "templates", permission: "templates.manage", section: "Settings" },
];

export function navFor(user: { role: Role }): NavItem[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return NAV.filter((i) => !i.permission || can(user, i.permission)).map(({ permission, ...item }) => item);
}
