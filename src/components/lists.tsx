import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { ActivityRow, ProjectRow, TaskRow } from "@/server/queries";
import { updateTaskStatus } from "@/server/task-actions";
import { TASK_STATUSES } from "@/lib/constants";
import { AutoSubmitSelect } from "./forms";
import {
  ApprovalBadge,
  Badge,
  DueDate,
  EmptyState,
  formatDate,
  Person,
  PriorityBadge,
  ProgressBar,
  ProjectStatusBadge,
  StatusBadge,
  Table,
  Td,
  Th,
  cn,
  isOverdue,
} from "./ui";

export function TaskTable({
  tasks,
  showProject = true,
  editableStatus = false,
  showAssignee = true,
  empty = "No tasks here.",
}: {
  tasks: TaskRow[];
  showProject?: boolean;
  editableStatus?: boolean;
  showAssignee?: boolean;
  empty?: string;
}) {
  if (tasks.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <Table>
      <thead>
        <tr>
          <Th>Task</Th>
          {showProject && <Th>Project</Th>}
          {showAssignee && <Th>Assignee</Th>}
          <Th>Status</Th>
          <Th>Priority</Th>
          <Th>Due</Th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => (
          <tr
            key={t.id}
            className={cn("hover:bg-zinc-50/70", isOverdue(t.dueDate, t.status) && "bg-red-50/30")}
          >
            <Td className="max-w-md">
              <Link href={`/tasks/${t.id}`} className="font-medium text-zinc-900 hover:text-indigo-600">
                {t.title}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                {t.moduleName && <Badge tone={t.moduleColor ?? "slate"}>{t.moduleName}</Badge>}
                {t.stage && <span>{t.stage}</span>}
                <ApprovalBadge status={t.approvalStatus} />
              </div>
            </Td>
            {showProject && (
              <Td className="max-w-[14rem]">
                <Link href={`/projects/${t.projectId}`} className="block truncate text-zinc-700 hover:text-indigo-600">
                  {t.projectName}
                </Link>
                <div className="truncate text-xs text-zinc-400">{t.clientName}</div>
              </Td>
            )}
            {showAssignee && (
              <Td>
                <Person name={t.assigneeName} />
              </Td>
            )}
            <Td>
              {editableStatus ? (
                <form action={updateTaskStatus}>
                  <input type="hidden" name="taskId" value={t.id} />
                  <AutoSubmitSelect
                    name="status"
                    defaultValue={t.status}
                    options={TASK_STATUSES}
                    className="w-40 min-w-40 text-xs"
                    aria-label="Status"
                  />
                </form>
              ) : (
                <StatusBadge status={t.status} />
              )}
            </Td>
            <Td>
              <PriorityBadge priority={t.priority} />
            </Td>
            <Td>
              <DueDate date={t.dueDate} status={t.status} />
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export function ProjectTable({ projects, showClient = true }: { projects: ProjectRow[]; showClient?: boolean }) {
  if (projects.length === 0) return <EmptyState>No projects found.</EmptyState>;
  return (
    <Table>
      <thead>
        <tr>
          <Th>Project</Th>
          {showClient && <Th>Client</Th>}
          <Th>Status</Th>
          <Th className="w-44">Progress</Th>
          <Th>Attention</Th>
          <Th>Owner</Th>
          <Th>End date</Th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => (
          <tr key={p.id} className="hover:bg-zinc-50/70">
            <Td className="max-w-sm">
              <Link href={`/projects/${p.id}`} className="font-medium text-zinc-900 hover:text-indigo-600">
                {p.name}
              </Link>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.modules.map((m) => (
                  <Badge key={m.name} tone={m.color}>
                    {m.name}
                  </Badge>
                ))}
              </div>
            </Td>
            {showClient && <Td className="text-zinc-700">{p.clientName}</Td>}
            <Td>
              <ProjectStatusBadge status={p.status} />
            </Td>
            <Td>
              <div className="flex min-w-32 items-center gap-2">
                <ProgressBar value={p.progress} />
                <span className="w-9 text-right text-xs text-zinc-500 tabular-nums">{p.progress}%</span>
              </div>
              <div className="mt-0.5 text-xs text-zinc-400">
                {p.done}/{p.total} tasks
              </div>
            </Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                {p.overdue > 0 && <Badge tone="red">{p.overdue} overdue</Badge>}
                {p.waiting > 0 && <Badge tone="amber">{p.waiting} awaiting approval</Badge>}
                {p.overdue === 0 && p.waiting === 0 && <span className="text-xs text-zinc-400">—</span>}
              </div>
            </Td>
            <Td>
              <Person name={p.ownerName} />
            </Td>
            <Td className="text-xs whitespace-nowrap text-zinc-600">{formatDate(p.endDate, "MMM d, yyyy")}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export function ActivityFeed({
  items,
  showProject = true,
  empty = "No activity yet.",
}: {
  items: ActivityRow[];
  showProject?: boolean;
  empty?: string;
}) {
  if (items.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <ul className="divide-y divide-zinc-100">
      {items.map((a) => (
        <li key={a.id} className="flex gap-3 px-4 py-2.5 text-sm">
          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", activityDot(a.action))} />
          <div className="min-w-0 flex-1">
            <p className="text-zinc-700">
              <span className="font-medium text-zinc-900">{a.actorName ?? "System"}</span>{" "}
              {a.taskId ? (
                <Link href={`/tasks/${a.taskId}`} className="hover:text-indigo-600">
                  {a.summary}
                </Link>
              ) : (
                a.summary
              )}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {formatDistanceToNow(a.createdAt, { addSuffix: true })}
              {showProject && a.projectName && a.projectId && (
                <>
                  {" · "}
                  <Link href={`/projects/${a.projectId}`} className="hover:text-zinc-700">
                    {a.projectName}
                  </Link>
                </>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function activityDot(action: string) {
  if (action.startsWith("approval.approved")) return "bg-emerald-500";
  if (action.startsWith("approval.rejected")) return "bg-red-500";
  if (action.startsWith("task.status")) return "bg-blue-500";
  if (action.startsWith("comment")) return "bg-violet-500";
  if (action.startsWith("file")) return "bg-teal-500";
  if (action.startsWith("project") || action.startsWith("module")) return "bg-amber-500";
  return "bg-zinc-300";
}
