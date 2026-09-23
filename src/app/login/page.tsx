import { redirect } from "next/navigation";
import { BadgeCheck, FolderKanban, MessagesSquare } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { loginAction } from "@/server/auth-actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, Input } from "@/components/ui";

export const metadata = { title: "Sign in" };

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "sara@northwind.agency" },
  { role: "Employee", email: "omar@northwind.agency" },
  { role: "Client", email: "lina@bloomcafe.com" },
];

const HIGHLIGHTS = [
  { icon: FolderKanban, title: "Every project in one place", text: "Clients, modules and tasks — no more spreadsheets." },
  { icon: BadgeCheck, title: "Client approvals built in", text: "Share deliverables and get sign-off in one click." },
  { icon: MessagesSquare, title: "Team and client chat", text: "Internal notes stay internal. Always." },
];

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  const showDemo = process.env.NODE_ENV !== "production" || process.env.SHOW_DEMO_ACCOUNTS === "true";

  return (
    <div className="flex min-h-screen">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden w-[46%] overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-24 size-[420px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold">
            A
          </span>
          <span className="text-lg font-semibold">AgencyOS</span>
        </div>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-4xl leading-tight font-semibold tracking-tight">
            Run your agency, <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">not your spreadsheets.</span>
          </h2>
          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <Icon className="size-5 text-indigo-300" />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm text-zinc-400">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-auto pt-12 text-xs text-zinc-500">© {new Date().getFullYear()} AgencyOS</p>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
              A
            </span>
            <span className="text-lg font-semibold">AgencyOS</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to your workspace to continue.</p>

          <ActionForm action={loginAction} className="mt-8 space-y-4">
            <Field label="Email">
              <Input name="email" type="email" autoComplete="email" required autoFocus placeholder="you@agency.com" className="py-2.5" />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className="py-2.5" />
            </Field>
            <SubmitButton className="w-full py-2.5" pendingText="Signing in…">
              Sign in
            </SubmitButton>
          </ActionForm>

          {showDemo && (
            <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white/60 p-4 text-xs text-zinc-600">
              <div className="mb-2 font-medium text-zinc-700">
                Demo accounts · password <code className="rounded bg-zinc-100 px-1">password</code>
              </div>
              <ul className="space-y-1.5">
                {DEMO_ACCOUNTS.map((a) => (
                  <li key={a.email} className="flex justify-between gap-2">
                    <span className="text-zinc-500">{a.role}</span>
                    <code>{a.email}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
