import type { Client } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { ActionForm, SubmitButton } from "./forms";
import { Checkbox, Field, Input, Textarea } from "./ui";

export function ClientForm({
  action,
  client,
  people,
  teamIds = [],
  submitLabel,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  client?: Client;
  people: { id: string; name: string; title: string | null }[];
  teamIds?: string[];
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} className="space-y-4" successMessage="Client saved.">
      {client && <input type="hidden" name="clientId" value={client.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name">
          <Input name="name" required defaultValue={client?.name} />
        </Field>
        <Field label="Industry">
          <Input name="industry" defaultValue={client?.industry ?? ""} />
        </Field>
        <Field label="Primary contact">
          <Input name="contactName" defaultValue={client?.contactName ?? ""} />
        </Field>
        <Field label="Contact email">
          <Input name="contactEmail" type="email" defaultValue={client?.contactEmail ?? ""} />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={client?.phone ?? ""} />
        </Field>
        <Field label="Website">
          <Input name="website" defaultValue={client?.website ?? ""} placeholder="https://" />
        </Field>
        <Field label="Internal notes" className="sm:col-span-2" hint="Never shown to the client.">
          <Textarea name="notes" defaultValue={client?.notes ?? ""} />
        </Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-zinc-700">Assigned team</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {people.map((p) => (
            <Checkbox key={p.id} name="teamIds" value={p.id} defaultChecked={teamIds.includes(p.id)} label={p.name} />
          ))}
        </div>
      </fieldset>
      {client ? (
        <Checkbox name="active" defaultChecked={client.active} label="Active client" />
      ) : (
        <input type="hidden" name="active" value="on" />
      )}
      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </ActionForm>
  );
}
