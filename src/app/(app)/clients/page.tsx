import Link from "next/link";
import { asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { clients, clientTeam, projects, users } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Avatar, Badge, Card, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const user = await requirePermission("clients.view");
  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      industry: clients.industry,
      contactName: clients.contactName,
      contactEmail: clients.contactEmail,
      active: clients.active,
      openProjects: sql<number>`(select count(*) from ${projects} where ${projects.clientId} = ${clients.id} and ${projects.status} in ('planning','active','on_hold'))`.mapWith(Number),
    })
    .from(clients)
    .where(eq(clients.orgId, user.orgId))
    .orderBy(asc(clients.name));
  const team = rows.length
    ? await db
        .select({ clientId: clientTeam.clientId, name: users.name })
        .from(clientTeam)
        .innerJoin(users, eq(users.id, clientTeam.userId))
        .where(inArray(clientTeam.clientId, rows.map((r) => r.id)))
    : [];

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${rows.filter((r) => r.active).length} active clients`}
        actions={can(user, "clients.manage") && <LinkButton href="/clients/new">New client</LinkButton>}
      />
      <Card padded={false}>
        {rows.length === 0 ? (
          <EmptyState>No clients yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Primary contact</Th>
                <Th>Open projects</Th>
                <Th>Assigned team</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/70">
                  <Td>
                    <Link href={`/clients/${c.id}`} className="font-medium hover:text-indigo-600">
                      {c.name}
                    </Link>
                    <div className="text-xs text-zinc-500">{c.industry}</div>
                  </Td>
                  <Td>
                    <div className="text-zinc-700">{c.contactName ?? "—"}</div>
                    <div className="text-xs text-zinc-500">{c.contactEmail}</div>
                  </Td>
                  <Td className="tabular-nums">{c.openProjects}</Td>
                  <Td>
                    <div className="flex -space-x-1">
                      {team
                        .filter((t) => t.clientId === c.id)
                        .map((t) => (
                          <span key={t.name} className="rounded-full ring-2 ring-white">
                            <Avatar name={t.name} />
                          </span>
                        ))}
                    </div>
                  </Td>
                  <Td>{c.active ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
