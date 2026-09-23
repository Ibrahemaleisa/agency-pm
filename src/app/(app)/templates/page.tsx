import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { moduleTemplates, type ModuleTemplate } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import { TONES } from "@/lib/constants";
import { saveTemplate } from "@/server/admin-actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Badge, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";

export const metadata = { title: "Module Templates" };

export default async function TemplatesPage() {
  const user = await requirePermission("templates.manage");
  const templates = await db
    .select()
    .from(moduleTemplates)
    .where(eq(moduleTemplates.orgId, user.orgId))
    .orderBy(asc(moduleTemplates.createdAt));

  return (
    <>
      <PageHeader
        title="Module templates"
        description="Reusable workflows. When a module is added to a project, its stages and fields are copied and a task is created per stage. Changes here apply to modules added afterwards."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.id} title={<Badge tone={t.color}>{t.name}</Badge>}>
            <TemplateForm template={t} />
          </Card>
        ))}
        <Card title="New template">
          <TemplateForm />
        </Card>
      </div>
    </>
  );
}

function TemplateForm({ template }: { template?: ModuleTemplate }) {
  const stages = template?.stages.map((s) => s.name + (s.clientApproval ? " *" : "")).join("\n") ?? "";
  const fields =
    template?.fields
      .map((f) => [f.label, f.type, f.options?.join(", ")].filter(Boolean).join(" | "))
      .join("\n") ?? "";
  return (
    <ActionForm action={saveTemplate} className="space-y-3" successMessage="Template saved.">
      {template && <input type="hidden" name="templateId" value={template.id} />}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Name" className="col-span-2">
          <Input name="name" defaultValue={template?.name} required />
        </Field>
        <Field label="Color">
          <Select name="color" defaultValue={template?.color ?? "slate"} options={TONES.map((t) => ({ value: t, label: t }))} />
        </Field>
      </div>
      <Field label="Description">
        <Input name="description" defaultValue={template?.description ?? ""} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Workflow stages" hint="One per line. End with * for a client-approval stage.">
          <Textarea name="stages" rows={8} defaultValue={stages} className="font-mono text-xs" />
        </Field>
        <Field label="Fields" hint="Label | type | options. Types: text, number, date, url, select, textarea.">
          <Textarea name="fields" rows={8} defaultValue={fields} className="font-mono text-xs" />
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton size="sm">{template ? "Save template" : "Create template"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
