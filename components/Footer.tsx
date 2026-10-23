import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "./Icons";

const shopLinks = [
  { href: "/shop", label: "Shop all" },
  { href: "/collections/apparel", label: "Apparel" },
  { href: "/collections/home", label: "Home & Living" },
  { href: "/collections/accessories", label: "Accessories" },
  { href: "/collections/personalized", label: "Personalized" },
];

const helpLinks = [
  { href: "/about#shipping", label: "Shipping & returns" },
  { href: "/about#sizing", label: "Sizing" },
  { href: "/about#contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-page px-4 pb-8 pt-14 md:px-6 md:pt-20">
        <div className="grid gap-12 border-b border-line pb-14 md:grid-cols-[1.1fr_0.6fr_0.6fr_0.8fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
              Independent shop · Made to order
            </p>
            <p className="mt-4 max-w-sm font-display text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
              Good things for people who are obsessed with their black lab.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="https://instagram.com/lucasvandeweerd"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center border border-line transition-colors hover:border-ink"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com/lucasvandeweerd"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center border border-line transition-colors hover:border-ink"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://youtube.com/@lucasvandeweerd"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex size-9 items-center justify-center border border-line transition-colors hover:border-ink"
              >
                <YouTubeIcon />
              </a>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
              Shop
            </p>
            <ul className="mt-5 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
              Help
            </p>
            <ul className="mt-5 space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-sm border border-line bg-white/50 p-5">
            <div className="flex items-center gap-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-line bg-paper">
                <Image
                  src="/brand/logo.png"
                  alt="Black Lab Spots logo"
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <p className="font-display text-base font-bold uppercase tracking-tight">
                  The good dog club
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">
                  Spot approves this message.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-smoke">
              Every order is printed when you place it — no deadstock, no
              landfill. Personalization is our love language.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[13ch] font-display text-[clamp(2.6rem,9vw,7rem)] font-extrabold uppercase leading-[0.82] tracking-tightest">
            Black Lab Spots
          </p>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">
              © {new Date().getFullYear()} Black Lab Spots Shop LLC
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">
              Visa · Mastercard · Amex · Apple Pay
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">
              Built for Spot. Obviously.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
