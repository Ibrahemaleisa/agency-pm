import Link from "next/link";
import { cn } from "./ui";

/** Row of link-based filter pills (keeps filters in the URL, no client JS). */
export function FilterTabs({
  options,
  current,
  hrefFor,
}: {
  options: { value: string; label: string; count?: number }[];
  current: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <Link
          key={o.value}
          href={hrefFor(o.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-sm font-medium transition",
            current === o.value ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 text-xs text-zinc-400 tabular-nums">{o.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function SearchBox({ defaultValue, placeholder, hidden }: { defaultValue?: string; placeholder: string; hidden?: Record<string, string | undefined> }) {
  return (
    <form className="w-full sm:w-64">
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="block w-full rounded-md border-0 bg-white px-2.5 py-1.5 text-sm shadow-xs ring-1 ring-zinc-300 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
    </form>
  );
}
