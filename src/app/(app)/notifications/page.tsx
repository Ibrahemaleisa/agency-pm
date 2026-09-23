import { desc, eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { AtSign, BadgeCheck, Bell, MessageSquare, RefreshCw, UserPlus } from "lucide-react";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { markAllNotificationsRead, markNotificationRead } from "@/server/admin-actions";
import { Button, Card, EmptyState, PageHeader, cn } from "@/components/ui";

export const metadata = { title: "Notifications" };

const ICONS: Record<string, typeof Bell> = {
  assigned: UserPlus,
  mention: AtSign,
  comment: MessageSquare,
  chat: MessageSquare,
  status: RefreshCw,
  approval: BadgeCheck,
};

export default async function NotificationsPage() {
  const user = await requireUser();
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
        title="Notifications"
        description={unread ? `${unread} unread` : "You're all caught up."}
        actions={
          unread > 0 && (
            <form action={markAllNotificationsRead}>
              <Button variant="secondary">Mark all as read</Button>
            </form>
          )
        }
      />
      <Card padded={false}>
        {items.length === 0 ? (
          <EmptyState>No notifications yet.</EmptyState>
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
                        "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-zinc-50",
                        !n.readAt && "bg-indigo-50/40",
                      )}
                    >
                      <span className={cn("mt-0.5 rounded-md p-1.5", n.readAt ? "bg-zinc-100 text-zinc-500" : "bg-indigo-100 text-indigo-700")}>
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm", n.readAt ? "text-zinc-600" : "font-medium text-zinc-900")}>{n.title}</span>
                        <span className="text-xs text-zinc-400">{formatDistanceToNow(n.createdAt, { addSuffix: true })}</span>
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
