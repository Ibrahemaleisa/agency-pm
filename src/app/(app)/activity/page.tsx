import { requirePermission } from "@/lib/auth";
import { listActivity } from "@/server/queries";
import { ActivityFeed } from "@/components/lists";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Activity Log" };

export default async function ActivityPage() {
  const user = await requirePermission("activity.viewAll");
  const items = await listActivity(user, { limit: 200 });
  return (
    <>
      <PageHeader title="Activity log" description="Every important change across the agency, newest first." />
      <Card padded={false}>
        <ActivityFeed items={items} />
      </Card>
    </>
  );
}
