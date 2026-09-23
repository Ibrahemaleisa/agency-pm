import { requirePermission } from "@/lib/auth";
import { createClient } from "@/server/admin-actions";
import { listInternalUsers } from "@/server/queries";
import { ClientForm } from "@/components/client-form";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "New client" };

export default async function NewClientPage() {
  const user = await requirePermission("clients.manage");
  const people = await listInternalUsers(user.orgId);
  return (
    <>
      <PageHeader title="New client" breadcrumb={[{ href: "/clients", label: "Clients" }]} />
      <Card className="max-w-3xl">
        <ClientForm action={createClient} people={people} submitLabel="Create client" />
      </Card>
    </>
  );
}
