import Link from "next/link";
import { ArrowUpRight } from "./Icons";

export function SectionHeading({
  kicker,
  title,
  href,
  linkLabel = "View all",
}: {
  kicker: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6 border-b border-line pb-4 md:mb-10">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
          {kicker}
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.9rem,4vw,3.4rem)] font-extrabold uppercase leading-[0.9] tracking-tightest">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="group mb-1 flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
        >
          {linkLabel}
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
