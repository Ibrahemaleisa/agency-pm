import type { ProjectModule } from "@/db/schema";
import { PRIORITIES } from "@/lib/constants";
import { createTask } from "@/server/task-actions";
import { ActionForm, SubmitButton } from "./forms";
import { Checkbox, Field, Input, Select, Textarea } from "./ui";

export function TaskCreateForm({
  projectId,
  modules,
  people,
  canAssign,
  canShare,
  defaultAssigneeId,
}: {
  projectId: string;
  modules: ProjectModule[];
  people: { id: string; name: string }[];
  canAssign: boolean;
  canShare: boolean;
  defaultAssigneeId: string;
}) {
  const moduleOptions = modules.flatMap((m) => [
    { value: `${m.id}::`, label: `${m.name} (no stage)` },
    ...m.stages.map((s) => ({ value: `${m.id}::${s.name}`, label: `${m.name} › ${s.name}` })),
  ]);
  return (
    <ActionForm action={createTask} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid gap-3 sm:grid-cols-6">
        <Field label="Title" className="sm:col-span-6">
          <Input name="title" required placeholder="What needs to be done?" />
        </Field>
        <Field label="Module / stage" className="sm:col-span-2">
          <Select name="moduleStage" placeholder="General (no module)" options={moduleOptions} />
        </Field>
        <Field label="Assignee" className="sm:col-span-2">
          {canAssign ? (
            <Select
              name="assigneeId"
              defaultValue={defaultAssigneeId}
              placeholder="Unassigned"
              options={people.map((p) => ({ value: p.id, label: p.name }))}
            />
          ) : (
            <Input disabled value="Me" />
          )}
        </Field>
        <Field label="Priority">
          <Select name="priority" defaultValue="medium" options={PRIORITIES} />
        </Field>
        <Field label="Due date">
          <Input type="date" name="dueDate" />
        </Field>
        <Field label="Description" className="sm:col-span-6">
          <Textarea name="description" rows={2} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4">
          {canShare && (
            <>
              <Checkbox name="clientVisible" label="Visible to client" />
              <Checkbox name="requiresApproval" label="Requires client approval" />
            </>
          )}
        </div>
        <SubmitButton>Create task</SubmitButton>
      </div>
    </ActionForm>
  );
}
