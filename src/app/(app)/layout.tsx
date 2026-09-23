import { eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { navFor } from "@/lib/navigation";
import { getT } from "@/lib/lang";
import { Sidebar } from "@/components/sidebar";
import { unreadNotificationCount } from "@/server/queries";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const { t, lang } = await getT();
  const [org, unread] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, user.orgId) }),
    unreadNotificationCount(user.id),
  ]);
  return (
    <div className="min-h-screen">
      <Sidebar
        items={navFor(user, t)}
        user={{ name: user.name, roleLabel: t.roles[user.role] }}
        lang={lang}
        labels={{
          more: t.nav.more,
          signOut: t.nav.signOut,
          alerts: t.nav.alerts,
          workspace: t.nav.workspace,
          close: t.nav.close,
        }}
        orgName={lang === "ar" && org?.name === "Fada" ? "فضاء" : (org?.name ?? "Agency")}
        initialUnread={unread}
      />
      <main className="min-w-0 md:ps-64">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-28 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
