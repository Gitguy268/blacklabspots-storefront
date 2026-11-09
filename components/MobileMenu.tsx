"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MAIN_NAV } from "@/lib/nav";
import { CloseIcon, MenuIcon } from "./Icons";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-start lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <MenuIcon className="size-5" />
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-80 flex flex-col bg-paper text-ink"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-4 md:px-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke">
                  Black Lab Spots
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-10 items-center justify-center"
                  aria-label="Close menu"
                >
                  <CloseIcon className="size-6" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col justify-center px-4 md:px-6">
                {MAIN_NAV.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline justify-between border-b border-line py-4"
                  >
                    <span className="font-display text-[clamp(2rem,9vw,4rem)] font-extrabold uppercase leading-none tracking-tightest">
                      {item.label}
                    </span>
                    <span className="font-mono text-[10px] text-smoke">
                      0{index + 1}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="flex items-center justify-between px-4 py-6 font-mono text-[10px] uppercase tracking-[0.16em] text-smoke md:px-6">
                <a
                  href="https://instagram.com/lucasvandeweerd"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
                <Link href="/about" onClick={() => setOpen(false)}>
                  Our story
                </Link>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
