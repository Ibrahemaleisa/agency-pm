import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, clientTeam, users } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import { isUuid } from "@/lib/access";
import { can } from "@/lib/permissions";
import { updateClient } from "@/server/admin-actions";
import { listInternalUsers, listProjects } from "@/server/queries";
import { ClientForm } from "@/components/client-form";
import { ProjectTable } from "@/components/lists";
import { Card, EmptyState, LinkButton, PageHeader, Person } from "@/components/ui";

export default async function ClientPage({ params }: PageProps<"/clients/[id]">) {
  const user = await requirePermission("clients.view");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const client = await db.query.clients.findFirst({ where: and(eq(clients.id, id), eq(clients.orgId, user.orgId)) });
  if (!client) notFound();

  const [projectRows, team, portalUsers, people] = await Promise.all([
    listProjects(user, { clientId: client.id }),
    db
      .select({ id: users.id, name: users.name, title: users.title })
      .from(clientTeam)
      .innerJoin(users, eq(users.id, clientTeam.userId))
      .where(eq(clientTeam.clientId, client.id)),
    db
      .select({ id: users.id, name: users.name, email: users.email, active: users.active })
      .from(users)
      .where(and(eq(users.clientId, client.id), eq(users.role, "client"))),
    listInternalUsers(user.orgId),
  ]);

  return (
    <>
      <PageHeader
        title={client.name}
        description={[client.industry, client.website].filter(Boolean).join(" · ")}
        breadcrumb={[{ href: "/clients", label: "Clients" }]}
        actions={
          can(user, "projects.manage") && (
            <LinkButton href={`/projects/new?clientId=${client.id}`}>New project</LinkButton>
          )
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card title="Projects" padded={false}>
            <ProjectTable projects={projectRows} showClient={false} />
          </Card>
          {can(user, "clients.manage") && (
            <Card title="Edit client">
              <ClientForm
                action={updateClient}
                client={client}
                people={people}
                teamIds={team.map((t) => t.id)}
                submitLabel="Save changes"
              />
            </Card>
          )}
        </div>
        <div className="min-w-0 space-y-6">
          <Card title="Contact">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs text-zinc-500">Name</dt><dd>{client.contactName ?? "—"}</dd></div>
              <div><dt className="text-xs text-zinc-500">Email</dt><dd>{client.contactEmail ?? "—"}</dd></div>
              <div><dt className="text-xs text-zinc-500">Phone</dt><dd>{client.phone ?? "—"}</dd></div>
            </dl>
            {client.notes && (
              <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                <div className="mb-1 text-xs font-medium">Internal notes</div>
                <p className="whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </Card>
          <Card title="Assigned team" padded={false}>
            {team.length === 0 ? (
              <EmptyState>No team assigned.</EmptyState>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {team.map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-4 py-2">
                    <Person name={t.name} />
                    <span className="text-xs text-zinc-500">{t.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Client portal users" padded={false} actions={can(user, "users.manage") && <LinkButton href="/team" size="sm" variant="secondary">Manage</LinkButton>}>
            {portalUsers.length === 0 ? (
              <EmptyState>No portal access yet. Add a client user from Team & Users.</EmptyState>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {portalUsers.map((u) => (
                  <li key={u.id} className="px-4 py-2 text-sm">
                    <div className="font-medium">{u.name} {!u.active && <span className="text-xs text-zinc-400">(inactive)</span>}</div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
