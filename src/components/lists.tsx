import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CalendarDays, ChevronRight, Clock, Inbox } from "lucide-react";
import type { ActivityRow, ProjectRow, TaskRow } from "@/server/queries";
import { updateTaskStatus } from "@/server/task-actions";
import { TASK_STATUSES } from "@/lib/constants";
import { AutoSubmitSelect } from "./forms";
import {
  ApprovalBadge,
  Avatar,
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
  toneDot,
} from "./ui";

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

function StatusControl({ task, editable, className }: { task: TaskRow; editable: boolean; className?: string }) {
  if (!editable) return <StatusBadge status={task.status} />;
  return (
    <form action={updateTaskStatus} className={className}>
      <input type="hidden" name="taskId" value={task.id} />
      <AutoSubmitSelect
        name="status"
        defaultValue={task.status}
        options={TASK_STATUSES}
        className="w-40 min-w-40 text-xs"
        aria-label="Status"
      />
    </form>
  );
}

/** Tasks as a table on desktop and as tappable cards on phones. */
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
  if (tasks.length === 0) return <EmptyState icon={<Inbox className="size-5" />}>{empty}</EmptyState>;
  return (
    <>
      {/* Phone: cards */}
      <ul className="divide-y divide-zinc-100 md:hidden">
        {tasks.map((t) => {
          const overdue = isOverdue(t.dueDate, t.status);
          return (
            <li key={t.id} className={cn("px-4 py-3", overdue && "bg-red-50/40")}>
              <Link href={`/tasks/${t.id}`} className="flex items-start gap-3">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", toneDot[TASK_STATUSES.find((s) => s.value === t.status)!.tone])} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-900">{t.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                    {showProject && <span className="truncate">{t.projectName}</span>}
                    {t.moduleName && <Badge tone={t.moduleColor ?? "slate"}>{t.moduleName}</Badge>}
                    <ApprovalBadge status={t.approvalStatus} />
                    {(t.priority === "high" || t.priority === "urgent") && <PriorityBadge priority={t.priority} />}
                  </span>
                </span>
                <ChevronRight className="mt-1 size-4 shrink-0 text-zinc-300" />
              </Link>
              <div className="mt-2 flex items-center justify-between gap-2 pl-5">
                <span className="flex items-center gap-3">
                  {showAssignee && <Avatar name={t.assigneeName} size="sm" />}
                  <DueDate date={t.dueDate} status={t.status} />
                </span>
                <StatusControl task={t} editable={editableStatus} />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block">
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
              <tr key={t.id} className={cn("transition hover:bg-zinc-50/80", isOverdue(t.dueDate, t.status) && "bg-red-50/30")}>
                <Td className="max-w-md">
                  <Link href={`/tasks/${t.id}`} className="font-medium text-zinc-900 hover:text-indigo-600">
                    {t.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
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
                  <StatusControl task={t} editable={editableStatus} />
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
      </div>
    </>
  );
}

/** Kanban-style board: one column per status. Scrolls sideways on small screens. */
export function TaskBoard({ tasks, editableStatus }: { tasks: TaskRow[]; editableStatus: boolean }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
      {TASK_STATUSES.map((s) => {
        const col = tasks.filter((t) => t.status === s.value);
        return (
          <section key={s.value} className="w-72 shrink-0 snap-start rounded-xl bg-zinc-100/70 p-2 md:w-auto">
            <header className="flex items-center justify-between px-2 py-1.5">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                <span className={cn("size-2 rounded-full", toneDot[s.tone])} />
                {s.label}
              </span>
              <span className="rounded-full bg-white px-2 text-xs font-medium text-zinc-500 tabular-nums">{col.length}</span>
            </header>
            <div className="mt-1 space-y-2">
              {col.map((t) => (
                <article
                  key={t.id}
                  className={cn(
                    "rounded-lg border bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition hover:shadow-md",
                    isOverdue(t.dueDate, t.status) ? "border-red-200" : "border-zinc-200/80",
                  )}
                >
                  <Link href={`/tasks/${t.id}`} className="block text-sm leading-snug font-medium text-zinc-900 hover:text-indigo-600">
                    {t.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {t.moduleName && <Badge tone={t.moduleColor ?? "slate"}>{t.moduleName}</Badge>}
                    <ApprovalBadge status={t.approvalStatus} />
                    {(t.priority === "high" || t.priority === "urgent") && <PriorityBadge priority={t.priority} />}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Avatar name={t.assigneeName} size="sm" />
                    <DueDate date={t.dueDate} status={t.status} />
                  </div>
                  {editableStatus && (
                    <StatusControl task={t} editable className="mt-2 [&_select]:w-full [&_select]:min-w-0" />
                  )}
                </article>
              ))}
              {col.length === 0 && <div className="rounded-lg border border-dashed border-zinc-300 py-6 text-center text-xs text-zinc-400">Nothing here</div>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

/** Projects as visual cards in a responsive grid. */
export function ProjectGrid({ projects, showClient = true }: { projects: ProjectRow[]; showClient?: boolean }) {
  if (projects.length === 0) return <EmptyState icon={<Inbox className="size-5" />}>No projects found.</EmptyState>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}`}
          className="group flex flex-col rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg md:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {showClient && <div className="truncate text-xs font-medium text-zinc-500">{p.clientName}</div>}
              <div className="mt-0.5 font-semibold leading-snug text-zinc-900 group-hover:text-indigo-600">{p.name}</div>
            </div>
            <ProjectStatusBadge status={p.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {p.modules.map((m) => (
              <Badge key={m.name} tone={m.color}>
                {m.name}
              </Badge>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="text-zinc-500">
                {p.done} of {p.total} tasks done
              </span>
              <span className="font-semibold text-zinc-900 tabular-nums">{p.progress}%</span>
            </div>
            <ProgressBar value={p.progress} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.overdue > 0 && (
              <Badge tone="red">
                <AlertTriangle className="size-3" /> {p.overdue} overdue
              </Badge>
            )}
            {p.waiting > 0 && (
              <Badge tone="amber">
                <Clock className="size-3" /> {p.waiting} awaiting approval
              </Badge>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 [&:not(:first-child)]:mt-4">
            <Person name={p.ownerName} />
            <span className="flex items-center gap-1 tabular-nums">
              <CalendarDays className="size-3.5" />
              {formatDate(p.endDate, "MMM d")}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Compact table version, used where space is tight. */
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
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => (
          <tr key={p.id} className="transition hover:bg-zinc-50/80">
            <Td className="max-w-sm">
              <Link href={`/projects/${p.id}`} className="font-medium text-zinc-900 hover:text-indigo-600">
                {p.name}
              </Link>
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
            </Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                {p.overdue > 0 && <Badge tone="red">{p.overdue} overdue</Badge>}
                {p.waiting > 0 && <Badge tone="amber">{p.waiting} awaiting</Badge>}
                {p.overdue === 0 && p.waiting === 0 && <span className="text-xs text-zinc-400">—</span>}
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

/* ------------------------------------------------------------------ */
/* Activity                                                            */
/* ------------------------------------------------------------------ */

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
    <ul className="relative px-4 py-2 md:px-5">
      <span className="absolute top-4 bottom-4 left-[27px] w-px bg-zinc-100 md:left-[31px]" />
      {items.map((a) => (
        <li key={a.id} className="relative flex gap-3 py-2.5 text-sm">
          <span className="relative z-10 mt-0.5">
            <Avatar name={a.actorName} size="xs" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-zinc-600">
              <span className="font-medium text-zinc-900">{a.actorName ?? "System"}</span>{" "}
              {a.taskId ? (
                <Link href={`/tasks/${a.taskId}`} className="hover:text-indigo-600">
                  {a.summary}
                </Link>
              ) : (
                a.summary
              )}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
              <span className={cn("size-1.5 rounded-full", activityDot(a.action))} />
              {formatDistanceToNow(a.createdAt, { addSuffix: true })}
              {showProject && a.projectName && a.projectId && (
                <>
                  <span>·</span>
                  <Link href={`/projects/${a.projectId}`} className="truncate hover:text-zinc-700">
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
