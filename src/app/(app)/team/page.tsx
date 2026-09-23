import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clients, users } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { createUser, updateUser } from "@/server/admin-actions";
import { listClientsForOrg } from "@/server/queries";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Avatar, Badge, Card, Checkbox, Field, Input, PageHeader, Select, Table, Td, Th } from "@/components/ui";

export const metadata = { title: "Team & Users" };

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export default async function TeamPage() {
  const admin = await requirePermission("users.manage");
  const [people, clientOptions] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        title: users.title,
        active: users.active,
        clientId: users.clientId,
        clientName: clients.name,
      })
      .from(users)
      .leftJoin(clients, eq(clients.id, users.clientId))
      .where(eq(users.orgId, admin.orgId))
      .orderBy(asc(users.role), asc(users.name)),
    listClientsForOrg(admin.orgId),
  ]);
  const clientSelect = clientOptions.map((c) => ({ value: c.id, label: c.name }));

  return (
    <>
      <PageHeader title="Team & Users" description="Manage staff and client portal accounts. Roles control what each person can see and do." />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={`Users (${people.length})`} padded={false} className="xl:col-span-2">
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id} className="align-top">
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size="md" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-zinc-500">{p.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={p.role === "admin" ? "violet" : p.role === "client" ? "amber" : "blue"}>{ROLE_LABELS[p.role]}</Badge>
                    <div className="mt-1 text-xs text-zinc-500">{p.role === "client" ? p.clientName : p.title}</div>
                  </Td>
                  <Td>{p.active ? <Badge tone="green">Active</Badge> : <Badge>Deactivated</Badge>}</Td>
                  <Td className="w-24 text-right">
                    <details className="group relative">
                      <summary className="cursor-pointer list-none text-xs font-medium text-indigo-600">Edit</summary>
                      <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-zinc-200/80 bg-white p-4 text-left shadow-lg">
                        <ActionForm action={updateUser} className="space-y-3" successMessage="Saved.">
                          <input type="hidden" name="userId" value={p.id} />
                          <Field label="Name"><Input name="name" defaultValue={p.name} required /></Field>
                          <Field label="Title"><Input name="title" defaultValue={p.title ?? ""} /></Field>
                          <Field label="Role"><Select name="role" defaultValue={p.role} options={roleOptions} /></Field>
                          <Field label="Client (for client users)">
                            <Select name="clientId" defaultValue={p.clientId ?? ""} placeholder="—" options={clientSelect} />
                          </Field>
                          <Field label="New password" hint="Leave blank to keep the current password.">
                            <Input name="password" type="password" minLength={8} autoComplete="new-password" />
                          </Field>
                          <Checkbox name="active" defaultChecked={p.active} label="Active" />
                          <div className="flex justify-end"><SubmitButton size="sm">Save</SubmitButton></div>
                        </ActionForm>
                      </div>
                    </details>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card title="Add user">
          <ActionForm action={createUser} className="space-y-3" resetOnSuccess successMessage="User created.">
            <Field label="Full name"><Input name="name" required /></Field>
            <Field label="Email"><Input name="email" type="email" required /></Field>
            <Field label="Title"><Input name="title" placeholder="e.g. Content Writer" /></Field>
            <Field label="Role"><Select name="role" defaultValue="employee" options={roleOptions} /></Field>
            <Field label="Client" hint="Required for client users — they only see this client's projects.">
              <Select name="clientId" placeholder="—" options={clientSelect} />
            </Field>
            <Field label="Temporary password" hint="At least 8 characters. Share it securely.">
              <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
            </Field>
            <div className="flex justify-end"><SubmitButton>Create user</SubmitButton></div>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
