import { desc, eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { AtSign, BadgeCheck, Bell, MessageSquare, RefreshCw, Sparkles, UserPlus } from "lucide-react";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { markAllNotificationsRead, markNotificationRead } from "@/server/admin-actions";
import { Button, Card, EmptyState, PageHeader, cn } from "@/components/ui";
import { getT } from "@/lib/lang";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.notifications.title };
}

const ICONS: Record<string, typeof Bell> = {
  assigned: UserPlus,
  mention: AtSign,
  comment: MessageSquare,
  chat: MessageSquare,
  status: RefreshCw,
  approval: BadgeCheck,
  lead: Sparkles,
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const { t, locale } = await getT();
  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100);
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <>
      <PageHeader
        title={t.notifications.title}
        description={unread ? t.notifications.unread(unread) : t.notifications.caughtUp}
        actions={
          unread > 0 && (
            <form action={markAllNotificationsRead}>
              <Button variant="secondary">{t.notifications.markAll}</Button>
            </form>
          )
        }
      />
      <Card padded={false}>
        {items.length === 0 ? (
          <EmptyState>{t.notifications.empty}</EmptyState>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {items.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <li key={n.id}>
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="link" value={n.link ?? ""} />
                    <button
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-zinc-50",
                        !n.readAt && "bg-indigo-50/40",
                      )}
                    >
                      <span className={cn("mt-0.5 rounded-md p-1.5", n.readAt ? "bg-zinc-100 text-zinc-500" : "bg-indigo-100 text-indigo-700")}>
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm", n.readAt ? "text-zinc-600" : "font-medium text-zinc-900")}>{n.title}</span>
                        <span className="text-xs text-zinc-400">{formatDistanceToNow(n.createdAt, { addSuffix: true, locale })}</span>
                      </span>
                      {!n.readAt && <span className="mt-2 size-2 rounded-full bg-indigo-600" />}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
