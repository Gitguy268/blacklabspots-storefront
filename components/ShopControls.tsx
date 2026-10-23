"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const SORTS = [
  { value: "featured", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "A–Z" },
];

export function ShopControls({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const sort = params.get("sort") ?? "featured";
  const query = params.get("q") ?? "";

  function update(next: Record<string, string | null>) {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "featured") search.delete(key);
      else search.set(key, value);
    }
    const qs = search.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="mb-8 flex flex-col gap-4 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">
        {total} {total === 1 ? "piece" : "pieces"} {isPending ? "· updating" : ""}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          action={pathname}
          method="get"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            update({ q: String(form.get("q") ?? "").trim() || null });
          }}
          className="flex items-center border-b border-ink/25 pb-1"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search the shop"
            aria-label="Search the shop"
            className="w-44 bg-transparent font-mono text-[11px] uppercase tracking-[0.08em] outline-none placeholder:text-smoke/70"
          />
          <button
            type="submit"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-smoke hover:text-ink"
          >
            Go
          </button>
        </form>

        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-smoke">
          <span className="sr-only">Sort products</span>
          <select
            value={sort}
            onChange={(event) => update({ sort: event.target.value })}
            className="cursor-pointer border border-line bg-paper px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink outline-none"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
