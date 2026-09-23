import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { attachments, projects, tasks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isUuid, taskScope } from "@/lib/access";
import { UPLOAD_DIR } from "@/lib/uploads";

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

  const filePath = path.join(UPLOAD_DIR, row.att.storageKey);
  if (!filePath.startsWith(UPLOAD_DIR)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(filePath);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": row.att.mimeType,
        "Content-Length": String(data.length),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(row.att.fileName)}`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("File missing", { status: 404 });
  }
}
