import { requireUser } from "@/lib/auth";
import { listTasks } from "@/server/queries";
import { TaskTable } from "@/components/lists";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const user = await requireUser();
  const isClient = user.role === "client";
  const [pending, decided] = await Promise.all([
    listTasks(user, { approvalPending: true }),
    listTasks(user, { approvalDecided: true, orderBy: "updated", limit: 20 }),
  ]);
  return (
    <>
      <PageHeader
        title="Approvals"
        description={
          isClient
            ? "Items waiting for your sign-off. Open an item to review deliverables and approve or request changes."
            : "Everything waiting on a client decision."
        }
      />
      <div className="min-w-0 space-y-6">
        <Card title={`Awaiting approval (${pending.length})`} padded={false}>
          <TaskTable tasks={pending} showProject empty="Nothing is waiting for approval." />
        </Card>
        <Card title="Recent decisions" padded={false}>
          <TaskTable tasks={decided} empty="No approval decisions yet." />
        </Card>
      </div>
    </>
  );
}
