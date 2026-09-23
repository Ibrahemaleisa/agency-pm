import "server-only";
import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, notifications, projectMembers, projects, users } from "@/db/schema";
import type { SessionUser } from "./auth";

/* ------------------------------------------------------------------ */
/* Activity log                                                        */
/* ------------------------------------------------------------------ */

export async function logActivity(
  actor: SessionUser,
  entry: {
    action: string;
    summary: string;
    projectId?: string | null;
    taskId?: string | null;
    clientVisible?: boolean;
  },
) {
  await db.insert(activityLog).values({
    orgId: actor.orgId,
    actorId: actor.id,
    action: entry.action,
    summary: entry.summary,
    projectId: entry.projectId ?? null,
    taskId: entry.taskId ?? null,
    clientVisible: entry.clientVisible ?? false,
  });
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type NotificationType = "assigned" | "mention" | "comment" | "status" | "approval" | "chat";

export async function notify(
  actor: SessionUser,
  recipientIds: Iterable<string | null | undefined>,
  n: { type: NotificationType; title: string; link?: string },
) {
  const ids = [...new Set([...recipientIds].filter((id): id is string => !!id && id !== actor.id))];
  if (ids.length === 0) return;
  await db.insert(notifications).values(
    ids.map((userId) => ({
      orgId: actor.orgId,
      userId,
      actorId: actor.id,
      type: n.type,
      title: n.title,
      link: n.link ?? null,
    })),
  );
}

/** People involved in a project: internal owner + members, and the client's portal users. */
export async function getProjectAudience(projectId: string) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project) return { internal: [], clients: [] };
  const members = await db
    .select({ userId: projectMembers.userId })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));
  const internalIds = new Set(members.map((m) => m.userId));
  if (project.ownerId) internalIds.add(project.ownerId);

  const people = await db
    .select({ id: users.id, name: users.name, role: users.role, email: users.email })
    .from(users)
    .where(
      and(
        eq(users.orgId, project.orgId),
        eq(users.active, true),
        or(
          internalIds.size ? inArray(users.id, [...internalIds]) : undefined,
          and(eq(users.role, "client"), eq(users.clientId, project.clientId)),
        ),
      ),
    );
  return {
    internal: people.filter((p) => p.role !== "client"),
    clients: people.filter((p) => p.role === "client"),
  };
}

/**
 * Resolve @mentions in text against a list of candidate users.
 * Matches "@firstname" or "@firstname.lastname" (case-insensitive).
 */
export function resolveMentions(text: string, candidates: { id: string; name: string }[]) {
  const tokens = [...text.matchAll(/@([\p{L}][\p{L}.\-]*)/gu)].map((m) =>
    m[1].toLowerCase().replace(/[.\-]+$/, ""),
  );
  if (tokens.length === 0) return [];
  const ids = new Set<string>();
  for (const c of candidates) {
    const parts = c.name.toLowerCase().split(/\s+/);
    const handles = [parts[0], parts.join("."), parts.join("")];
    if (tokens.some((t) => handles.includes(t))) ids.add(c.id);
  }
  return [...ids];
}
