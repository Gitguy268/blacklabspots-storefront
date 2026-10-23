import Link from "next/link";
import { MAIN_NAV } from "@/lib/nav";
import { CartButton } from "./CartButton";
import { MobileMenu } from "./MobileMenu";
import { Marquee } from "./Marquee";

export function Header() {
  return (
    <>
      <Marquee />
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-1 md:gap-4">
            <MobileMenu />
            <Link
              href="/"
              className="group flex items-baseline gap-2 font-display text-[17px] font-extrabold uppercase leading-none tracking-[-0.035em] md:text-[20px]"
            >
              <span className="flex items-baseline gap-1.5">
                <span>Black</span>
                <span>Lab</span>
              </span>
              <span className="relative">
                Spots
                <span className="absolute -right-2 -top-1 size-1.5 rounded-full bg-spot transition-transform duration-300 group-hover:scale-150" />
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline font-mono text-[10px] uppercase tracking-[0.16em] text-ink/80 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-smoke transition-colors hover:text-ink md:inline"
            >
              Our story
            </Link>
            <CartButton />
          </div>
        </div>
      </header>
    </>
  );
}
