import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center md:py-32">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
        404 — Off leash
      </p>
      <h1 className="mt-3 font-display text-[clamp(3rem,8vw,6rem)] font-extrabold uppercase leading-[0.86] tracking-tightest">
        This page
        <br />
        ran off.
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke">
        Spot probably followed a squirrel. We’ll make him come back. In the
        meantime, the good stuff is right this way.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/shop"
          className="bg-ink px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper"
        >
          Shop all
        </Link>
        <Link
          href="/"
          className="border border-line px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em]"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
