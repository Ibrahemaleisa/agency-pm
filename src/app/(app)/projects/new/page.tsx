import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { moduleTemplates } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import { createProject } from "@/server/project-actions";
import { listClientsForOrg, listInternalUsers } from "@/server/queries";
import { ProjectForm } from "@/components/project-form";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "New project" };

export default async function NewProjectPage({ searchParams }: PageProps<"/projects/new">) {
  const user = await requirePermission("projects.manage");
  const sp = await searchParams;
  const [clients, people, templates] = await Promise.all([
    listClientsForOrg(user.orgId),
    listInternalUsers(user.orgId),
    db.select().from(moduleTemplates).where(eq(moduleTemplates.orgId, user.orgId)).orderBy(asc(moduleTemplates.createdAt)),
  ]);
  return (
    <>
      <PageHeader
        title="New project"
        breadcrumb={[{ href: "/projects", label: "Projects" }]}
        description="Pick the client and the modules they purchased. Each module creates its workflow tasks automatically."
      />
      <Card className="max-w-3xl">
        <ProjectForm
          action={createProject}
          clients={clients}
          people={people}
          memberIds={[user.id]}
          defaultOwnerId={user.id}
          templates={templates}
          defaultClientId={typeof sp.clientId === "string" ? sp.clientId : undefined}
          submitLabel="Create project"
        />
      </Card>
    </>
  );
}
