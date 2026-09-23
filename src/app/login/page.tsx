import { redirect } from "next/navigation";
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

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
            A
          </div>
          <span className="text-lg font-semibold">AgencyOS</span>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-base font-semibold">Sign in to your workspace</h1>
          <ActionForm action={loginAction} className="mt-4 space-y-3">
            <Field label="Email">
              <Input name="email" type="email" autoComplete="email" required autoFocus />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" autoComplete="current-password" required />
            </Field>
            <SubmitButton className="w-full" pendingText="Signing in…">
              Sign in
            </SubmitButton>
          </ActionForm>
        </div>
        {(process.env.NODE_ENV !== "production" || process.env.SHOW_DEMO_ACCOUNTS === "true") && (
          <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-600">
            <div className="mb-2 font-medium text-zinc-700">Demo accounts (password: <code>password</code>)</div>
            <ul className="space-y-1">
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
    </div>
  );
}
