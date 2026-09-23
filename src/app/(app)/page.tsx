import Link from "next/link";
import { format } from "date-fns";
import {
  AlarmClock,
  AlertTriangle,
  BadgeCheck,
  Eye,
  FolderKanban,
  Inbox,
  ListTodo,
  Percent,
  UserX,
} from "lucide-react";
import { requireUser, type SessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { TASK_STATUSES } from "@/lib/constants";
import {
  listActivity,
  listProjects,
  listTasks,
  taskCountsByStatus,
  teamWorkload,
} from "@/server/queries";
import { ActivityFeed, ProjectGrid, TaskTable } from "@/components/lists";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  Stat,
  cn,
  toneDot,
} from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  if (can(user, "dashboard.admin")) return <AdminDashboard user={user} />;
  if (can(user, "dashboard.client")) return <ClientDashboard user={user} />;
  return <EmployeeDashboard user={user} />;
}

/* ------------------------------------------------------------------ */

async function AdminDashboard({ user }: { user: SessionUser }) {
  const [openProjects, overdueAll, approvalsAll, unassignedTasks, byStatus, workload, activity] =
    await Promise.all([
      listProjects(user, { status: "open" }),
      listTasks(user, { overdue: true }),
      listTasks(user, { approvalPending: true }),
      listTasks(user, { assigneeId: null, status: "open" }),
      taskCountsByStatus(user),
      teamWorkload(user),
      listActivity(user, { limit: 12 }),
    ]);
  const active = openProjects.filter((p) => p.status === "active");
  const overdue = overdueAll.slice(0, 8);
  const approvals = approvalsAll.slice(0, 8);
  const unassigned = unassignedTasks.length;

  return (
    <>
      <PageHeader title={`Good ${greeting()}, ${user.name.split(" ")[0]}`} description={`${today()} · Agency overview`} />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
        <Stat label="Active projects" value={active.length} href="/projects?status=active" tone="slate" icon={<FolderKanban className="size-4" />} />
        <Stat label="Overdue tasks" value={overdueAll.length} tone={overdueAll.length ? "red" : "slate"} href="/tasks?view=overdue" icon={<AlertTriangle className="size-4" />} />
        <Stat label="Pending approvals" value={approvalsAll.length} tone={approvalsAll.length ? "amber" : "slate"} href="/approvals" icon={<BadgeCheck className="size-4" />} />
        <Stat label="In review" value={byStatus.review ?? 0} tone="violet" href="/tasks?status=review" icon={<Eye className="size-4" />} />
        <Stat label="Unassigned" value={unassigned} href="/tasks?view=unassigned" icon={<UserX className="size-4" />} hint="Open tasks with no owner" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Tasks by status" className="lg:col-span-1">
          <StatusBars counts={byStatus} />
        </Card>
        <Card title="Team workload" className="lg:col-span-2" padded={false}>
          <WorkloadBars rows={workload} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card title={<CardTitle icon={<AlertTriangle className="size-4 text-red-500" />}>Overdue tasks</CardTitle>} actions={<SeeAll href="/tasks?view=overdue" />} padded={false}>
            <TaskTable tasks={overdue} showProject={false} empty="Nothing overdue. Nice work!" />
          </Card>
          <Card title={<CardTitle icon={<BadgeCheck className="size-4 text-amber-500" />}>Waiting on client approval</CardTitle>} actions={<SeeAll href="/approvals" />} padded={false}>
            <TaskTable tasks={approvals} showProject={false} empty="No approvals pending." />
          </Card>
        </div>
        <Card title="Recent activity" actions={<SeeAll href="/activity" />} padded={false}>
          <ActivityFeed items={activity} />
        </Card>
      </div>

      <SectionHeading title="Open projects" action={<SeeAll href="/projects" />} />
      <ProjectGrid projects={openProjects.slice(0, 6)} />
    </>
  );
}

/* ------------------------------------------------------------------ */

async function EmployeeDashboard({ user }: { user: SessionUser }) {
  const [mine, dueToday, overdue, review, activity, myProjects] = await Promise.all([
    listTasks(user, { assigneeId: user.id, status: "open" }),
    listTasks(user, { assigneeId: user.id, dueToday: true }),
    listTasks(user, { assigneeId: user.id, overdue: true }),
    listTasks(user, { status: "review" }),
    listActivity(user, { limit: 10 }),
    listProjects(user, { status: "open" }),
  ]);
  // "Waiting for me": items in review I created/own + my tasks where the client asked for changes.
  const waitingForMe = [
    ...review.filter((t) => t.assigneeId !== user.id),
    ...mine.filter((t) => t.approvalStatus === "rejected"),
  ];
  const clientWaiting = mine.filter((t) => t.status === "waiting_client");

  return (
    <>
      <PageHeader title={`Good ${greeting()}, ${user.name.split(" ")[0]}`} description={`${today()} · Here's what needs your attention.`} />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Stat label="My open tasks" value={mine.length} href="/tasks" tone="slate" icon={<ListTodo className="size-4" />} />
        <Stat label="Due today" value={dueToday.length} tone={dueToday.length ? "amber" : "slate"} href="/tasks?view=today" icon={<AlarmClock className="size-4" />} />
        <Stat label="Overdue" value={overdue.length} tone={overdue.length ? "red" : "slate"} href="/tasks?view=overdue" icon={<AlertTriangle className="size-4" />} />
        <Stat label="Waiting for me" value={waitingForMe.length} tone="violet" hint="Reviews + change requests" icon={<Inbox className="size-4" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {(overdue.length > 0 || dueToday.length > 0) && (
            <Card title="Due today & overdue" padded={false}>
              <TaskTable tasks={[...overdue, ...dueToday]} editableStatus showAssignee={false} />
            </Card>
          )}
          <Card title="Waiting for me" padded={false}>
            <TaskTable tasks={waitingForMe} editableStatus empty="Nothing waiting on you." />
          </Card>
          <Card title="My tasks" actions={<SeeAll href="/tasks" />} padded={false}>
            <TaskTable
              tasks={mine.filter((t) => t.status !== "waiting_client")}
              editableStatus
              showAssignee={false}
              empty="You have no open tasks."
            />
          </Card>
          {clientWaiting.length > 0 && (
            <Card title="Blocked on client" padded={false}>
              <TaskTable tasks={clientWaiting} showAssignee={false} />
            </Card>
          )}
        </div>
        <div className="min-w-0 space-y-6">
          <Card title="My projects" padded={false}>
            {myProjects.length === 0 ? (
              <EmptyState>You&apos;re not on any active projects.</EmptyState>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {myProjects.map((p) => (
                  <li key={p.id} className="px-4 py-3">
                    <Link href={`/projects/${p.id}`} className="text-sm font-medium hover:text-indigo-600">
                      {p.name}
                    </Link>
                    <div className="text-xs text-zinc-500">{p.clientName}</div>
                    <ProgressBar value={p.progress} className="mt-2" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Recent activity" padded={false}>
            <ActivityFeed items={activity} />
          </Card>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

async function ClientDashboard({ user }: { user: SessionUser }) {
  const [myProjects, approvals, activity] = await Promise.all([
    listProjects(user),
    listTasks(user, { approvalPending: true }),
    listActivity(user, { limit: 12 }),
  ]);
  const upcoming = myProjects.filter((p) => p.status === "active" || p.status === "planning");

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description={`${today()} · Your projects at a glance.`} />

      {approvals.length > 0 && (
        <Link
          href="/approvals"
          className="mb-6 flex items-center gap-4 rounded-xl bg-ink p-4 text-white shadow-lg shadow-black/10 transition hover:shadow-xl md:p-5"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand-200 text-ink">
            <BadgeCheck className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">
              {approvals.length} item{approvals.length > 1 ? "s" : ""} waiting for your approval
            </span>
            <span className="block text-sm text-zinc-400">Your feedback keeps the project moving.</span>
          </span>
          <span className="hidden rounded-lg bg-sand-200 px-3 py-2 text-sm font-semibold text-ink sm:block">Review now</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        <Stat label="Active projects" value={upcoming.length} tone="slate" icon={<FolderKanban className="size-4" />} />
        <Stat label="Pending approvals" value={approvals.length} tone={approvals.length ? "amber" : "slate"} href="/approvals" icon={<BadgeCheck className="size-4" />} />
        <Stat
          label="Overall progress"
          tone="slate"
          icon={<Percent className="size-4" />}
          value={`${myProjects.length ? Math.round(myProjects.reduce((s, p) => s + p.progress, 0) / myProjects.length) : 0}%`}
        />
      </div>

      <SectionHeading title="Your projects" />
      <ProjectGrid projects={myProjects} showClient={false} />

      <SectionHeading title="Recent updates" />
      <Card padded={false}>
        <ActivityFeed items={activity} empty="No updates yet." />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */

function StatusBars({ counts }: { counts: Record<string, number | undefined> }) {
  const total = TASK_STATUSES.reduce((s, x) => s + (counts[x.value] ?? 0), 0);
  const max = Math.max(1, ...TASK_STATUSES.map((s) => counts[s.value] ?? 0));
  return (
    <div className="space-y-3">
      {TASK_STATUSES.map((s) => {
        const n = counts[s.value] ?? 0;
        return (
          <Link
            key={s.value}
            href={`/tasks?status=${s.value}`}
            className="group block"
            title={`${s.label}: ${n} task${n === 1 ? "" : "s"} (${total ? Math.round((n / total) * 100) : 0}%)`}
          >
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600 group-hover:text-zinc-900">
                <span className={cn("size-2 rounded-full", toneDot[s.tone])} />
                {s.label}
              </span>
              <span className="font-medium text-zinc-900 tabular-nums">{n}</span>
            </div>
            <div className="h-2 rounded-r bg-zinc-100">
              <div className={cn("h-2 rounded-r", toneDot[s.tone])} style={{ width: `${(n / max) * 100}%` }} />
            </div>
          </Link>
        );
      })}
      <div className="border-t border-zinc-100 pt-2 text-xs text-zinc-500">{total} tasks across open projects</div>
    </div>
  );
}

function WorkloadBars({ rows }: { rows: Awaited<ReturnType<typeof teamWorkload>> }) {
  const max = Math.max(1, ...rows.map((r) => r.open));
  return (
    <ul className="divide-y divide-zinc-100">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
          <Avatar name={r.name} />
          <div className="w-36 min-w-0 shrink-0">
            <Link href={`/tasks?assignee=${r.id}`} className="block truncate text-sm font-medium hover:text-indigo-600">
              {r.name}
            </Link>
            <div className="truncate text-xs text-zinc-400">{r.title}</div>
          </div>
          <div className="flex-1" title={`${r.name}: ${r.open} open, ${r.overdue} overdue, ${r.inReview} in review`}>
            <div className="h-2 rounded-r bg-zinc-100">
              <div className="h-2 rounded-r bg-indigo-500" style={{ width: `${(r.open / max) * 100}%` }} />
            </div>
          </div>
          <div className="w-28 shrink-0 text-right text-xs tabular-nums">
            <span className="font-medium text-zinc-900">{r.open} open</span>
            {r.overdue > 0 && <span className="ml-1.5 font-medium text-red-600">{r.overdue} late</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      {action}
    </div>
  );
}

function CardTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      {children}
    </span>
  );
}

function today() {
  return format(new Date(), "EEEE, MMMM d");
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link href={href} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
      View all
    </Link>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}
