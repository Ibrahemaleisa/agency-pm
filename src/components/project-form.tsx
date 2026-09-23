import type { Project } from "@/db/schema";
import { PROJECT_STATUSES } from "@/lib/constants";
import type { ActionState } from "@/lib/action-state";
import { ActionForm, SubmitButton } from "./forms";
import { Checkbox, Field, Input, Select, Textarea } from "./ui";

type Option = { id: string; name: string; title?: string | null };

export function ProjectForm({
  action,
  project,
  clients,
  people,
  memberIds = [],
  templates,
  defaultClientId,
  defaultOwnerId,
  submitLabel,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  project?: Project;
  clients?: Option[];
  people: Option[];
  memberIds?: string[];
  templates?: { id: string; name: string; description: string | null }[];
  defaultClientId?: string;
  defaultOwnerId?: string;
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} className="space-y-4" successMessage="Project saved.">
      {project && <input type="hidden" name="projectId" value={project.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project name" className="sm:col-span-2">
          <Input name="name" required defaultValue={project?.name} placeholder="e.g. Q4 Brand Refresh" />
        </Field>
        {clients && (
          <Field label="Client">
            <Select
              name="clientId"
              required
              defaultValue={defaultClientId}
              placeholder="Select a client…"
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
        )}
        <Field label="Status">
          <Select name="status" defaultValue={project?.status ?? "planning"} options={PROJECT_STATUSES} />
        </Field>
        <Field label="Project owner">
          <Select
            name="ownerId"
            defaultValue={project?.ownerId ?? defaultOwnerId}
            options={people.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Field>
        <Field label="Start date">
          <Input type="date" name="startDate" defaultValue={project?.startDate ?? undefined} />
        </Field>
        <Field label="End date">
          <Input type="date" name="endDate" defaultValue={project?.endDate ?? undefined} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea name="description" defaultValue={project?.description ?? undefined} />
        </Field>
      </div>

      {templates && (
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-zinc-700">Modules (what the client purchased)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {templates.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer gap-2 rounded-md border border-zinc-200 p-3 hover:bg-zinc-50 has-checked:border-indigo-300 has-checked:bg-indigo-50/50"
              >
                <input type="checkbox" name="templateIds" value={t.id} className="mt-0.5 size-4 rounded border-zinc-300 text-indigo-600" />
                <span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-xs text-zinc-500">{t.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-xs font-medium text-zinc-700">Team members with access</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {people.map((p) => (
            <Checkbox
              key={p.id}
              name="memberIds"
              value={p.id}
              defaultChecked={memberIds.includes(p.id)}
              label={
                <span>
                  {p.name} {p.title && <span className="text-xs text-zinc-400">· {p.title}</span>}
                </span>
              }
            />
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </ActionForm>
  );
}
