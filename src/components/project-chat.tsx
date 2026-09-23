import Link from "next/link";
import { format, isToday } from "date-fns";
import { Lock, Users } from "lucide-react";
import { sendChatMessage } from "@/server/project-actions";
import { ActionForm, AutoRefresh, SubmitButton } from "./forms";
import { Avatar, Badge, EmptyState, Textarea, cn } from "./ui";

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: Date;
  authorName: string | null;
  authorRole: string | null;
};

export function ProjectChat({
  projectId,
  channel,
  channels,
  messages,
  currentUserName,
}: {
  projectId: string;
  channel: "internal" | "client";
  channels: ("internal" | "client")[];
  messages: ChatMessage[];
  currentUserName: string;
}) {
  return (
    <div className="flex h-[calc(100vh-18rem)] min-h-[420px] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xs">
      <AutoRefresh intervalMs={5000} />
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2">
        <div className="flex gap-1">
          {channels.map((c) => (
            <Link
              key={c}
              href={`/projects/${projectId}?tab=chat&channel=${c}`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium",
                c === channel ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              {c === "internal" ? <Lock className="size-3.5" /> : <Users className="size-3.5" />}
              {c === "internal" ? "Team (internal)" : "Client conversation"}
            </Link>
          ))}
        </div>
        <span className="hidden text-xs text-zinc-400 sm:block">
          {channel === "internal" ? "Only agency staff can see this channel" : "Visible to the client"}
        </span>
      </div>

      {/* flex-col-reverse keeps the view anchored to the newest message */}
      <div className="flex flex-1 flex-col-reverse overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <EmptyState>No messages yet. Start the conversation.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => {
              const mine = m.authorName === currentUserName;
              return (
                <li key={m.id} className="flex gap-2.5">
                  <Avatar name={m.authorName} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">{m.authorName ?? "Deleted user"}</span>
                      {m.authorRole === "client" && <Badge tone="amber">Client</Badge>}
                      <span className="text-xs text-zinc-400">
                        {format(m.createdAt, isToday(m.createdAt) ? "h:mm a" : "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className={cn("mt-0.5 text-sm whitespace-pre-wrap text-zinc-700", mine && "text-zinc-900")}>
                      <Highlight text={m.body} />
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ActionForm action={sendChatMessage} resetOnSuccess className="border-t border-zinc-100 p-3">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="channel" value={channel} />
        <div className="flex items-end gap-2">
          <Textarea
            name="body"
            rows={2}
            required
            placeholder={`Message ${channel === "internal" ? "the team" : "everyone incl. client"}… use @name to mention`}
          />
          <SubmitButton pendingText="Sending…">Send</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}

/** Render @mentions in bold. */
export function Highlight({ text }: { text: string }) {
  const parts = text.split(/(@[\p{L}][\p{L}.\-]*)/gu);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("@") ? (
          <span key={i} className="font-medium text-indigo-600">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}
