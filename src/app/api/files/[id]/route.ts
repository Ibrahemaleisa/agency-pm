import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { attachments, projects, tasks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isUuid, taskScope } from "@/lib/access";
import { loadFile } from "@/lib/uploads";

export async function GET(_req: Request, ctx: RouteContext<"/api/files/[id]">) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });

  const [row] = await db
    .select({ att: attachments })
    .from(attachments)
    .innerJoin(tasks, eq(tasks.id, attachments.taskId))
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(
      and(
        eq(attachments.id, id),
        taskScope(user),
        user.role === "client" ? eq(attachments.clientVisible, true) : undefined,
      ),
    )
    .limit(1);
  if (!row) return new Response("Not found", { status: 404 });

  const body = await loadFile(row.att.storageKey);
  if (!body) return new Response("File missing", { status: 404 });
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": row.att.mimeType,
      "Content-Length": String(row.att.size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(row.att.fileName)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
