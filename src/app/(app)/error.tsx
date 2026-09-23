"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-200/80 bg-white p-6 text-center">
      <h2 className="text-base font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-zinc-500">{error.message || "An unexpected error occurred."}</p>
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={reset} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white">
          Try again
        </button>
        <Link href="/" className="rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-zinc-300">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
