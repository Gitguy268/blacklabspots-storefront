import type { ReactNode } from "react";
import { PlusIcon } from "./Icons";

export function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="group border-t border-line py-4" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
          {title}
        </span>
        <PlusIcon className="size-3.5 transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pt-4 text-sm leading-relaxed text-smoke">{children}</div>
    </details>
  );
}
