"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Send } from "lucide-react";
import { submitLead } from "@/server/lead-actions";
import type { Dict } from "@/lib/i18n";
import { restoreValues } from "@/components/forms";

type Copy = Dict["contact"];

const field =
  "block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-indigo-400/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/15";

export function LeadForm({ t, services }: { t: Copy; services: { key: string; title: string }[] }) {
  const [state, action] = useActionState(submitLead, undefined);
  const ref = useRef<HTMLFormElement>(null);
  const submitted = useRef<FormData | null>(null);
  useEffect(() => {
    if (state?.error && ref.current && submitted.current) restoreValues(ref.current, submitted.current);
  }, [state]);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-400/15">
          <CheckCircle2 className="size-7 text-emerald-300" />
        </span>
        <p className="font-display text-lg font-medium text-white">{t.success}</p>
      </div>
    );
  }

  return (
    <form
      ref={ref}
      action={action}
      onSubmit={(e) => (submitted.current = new FormData(e.currentTarget))}
      className="grid gap-4 sm:grid-cols-2"
    >
      {/* Honeypot field for bots — hidden from people and screen readers */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {state?.error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 sm:col-span-2">{state.error}</p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-zinc-400">{t.name} *</span>
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-zinc-400">{t.company}</span>
        <input name="company" autoComplete="organization" className={field} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-zinc-400">{t.email}</span>
        <input name="email" type="email" autoComplete="email" dir="ltr" className={`${field} text-start`} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-zinc-400">{t.phone}</span>
        <input name="phone" type="tel" autoComplete="tel" dir="ltr" className={`${field} text-start`} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-xs font-medium text-zinc-400">{t.service}</span>
        <select name="service" defaultValue="" className={`${field} appearance-none`}>
          <option value="" className="bg-zinc-900">—</option>
          {services.map((s) => (
            <option key={s.key} value={s.title} className="bg-zinc-900">
              {s.title}
            </option>
          ))}
          <option value={t.notSure} className="bg-zinc-900">
            {t.notSure}
          </option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-xs font-medium text-zinc-400">{t.message}</span>
        <textarea name="message" rows={4} className={field} />
      </label>
      <div className="sm:col-span-2">
        <SubmitButton label={t.submit} pending={t.sending} />
      </div>
    </form>
  );
}

function SubmitButton({ label, pending }: { label: string; pending: string }) {
  const { pending: isPending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={isPending}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 disabled:opacity-60 sm:w-auto"
    >
      {isPending ? pending : label}
      <Send className="size-4 transition group-hover:-translate-y-0.5 rtl:-scale-x-100" />
    </button>
  );
}
