import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-200/80 bg-white p-6 text-center">
      <h2 className="text-base font-semibold">Not found</h2>
      <p className="mt-2 text-sm text-zinc-500">
        This item doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium text-indigo-600">
        Back to dashboard
      </Link>
    </div>
  );
}
