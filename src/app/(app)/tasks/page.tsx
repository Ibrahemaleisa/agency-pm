import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { TASK_STATUSES } from "@/lib/constants";
import { listInternalUsers, listTasks, type TaskFilter } from "@/server/queries";
import { TaskTable } from "@/components/lists";
import { FilterTabs, SearchBox } from "@/components/filters";
import { Card, PageHeader } from "@/components/ui";
import type { TaskStatus } from "@/db/schema";

export const metadata = { title: "Tasks" };

const VIEWS = [
  { value: "mine", label: "My tasks" },
  { value: "all", label: "All open" },
  { value: "today", label: "Due today" },
  { value: "overdue", label: "Overdue" },
  { value: "blocked", label: "Waiting for client" },
  { value: "unassigned", label: "Unassigned" },
] as const;

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const user = await requirePermission("tasks.updateStatus");
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const status = get("status") as TaskStatus | undefined;
  const assignee = get("assignee");
  const q = get("q");
  const view = get("view") ?? (status || assignee ? "all" : user.role === "admin" ? "all" : "mine");

  const filter: TaskFilter = { q };
  if (view === "mine") filter.assigneeId = user.id;
  if (view === "today") filter.dueToday = true;
  if (view === "overdue") filter.overdue = true;
  if (view === "blocked") filter.status = "waiting_client";
  if (view === "unassigned") filter.assigneeId = null;
  if (status && TASK_STATUSES.some((s) => s.value === status)) filter.status = status;
  else if (!filter.status && view !== "overdue" && view !== "today") filter.status = "open";
  if (assignee) filter.assigneeId = assignee;

  const [tasks, people] = await Promise.all([listTasks(user, filter), listInternalUsers(user.orgId)]);
  const assigneeName = assignee ? people.find((p) => p.id === assignee)?.name : undefined;

  return (
    <>
      <PageHeader
        title="Tasks"
        description={
          assigneeName
            ? `Open tasks assigned to ${assigneeName}`
            : status
              ? `Tasks with status: ${TASK_STATUSES.find((s) => s.value === status)?.label}`
              : "Everything that needs to be done, and who's on it."
        }
      />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          current={assignee || status ? "" : view}
          options={VIEWS.filter((v) => v.value !== "unassigned" || can(user, "tasks.assign")).map((v) => ({ ...v }))}
          hrefFor={(v) => `/tasks?view=${v}`}
        />
        <SearchBox defaultValue={q} placeholder="Search tasks…" hidden={{ view, status, assignee }} />
      </div>
      <Card padded={false}>
        <TaskTable tasks={tasks} editableStatus showAssignee={view !== "mine"} empty="No tasks match this view." />
      </Card>
    </>
  );
}
