export function Marquee() {
  const message =
    "MADE TO ORDER · FREE SHIPPING OVER $75 · PERSONALIZE ALMOST ANYTHING · GOOD DOG ENERGY · SHIPS IN 4–10 BUSINESS DAYS";

  return (
    <div className="overflow-hidden border-b border-ink/10 bg-ink py-2 text-paper">
      <div className="marquee-track flex w-max items-center">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1}
          >
            {Array.from({ length: 2 }).map((_, index) => (
              <span
                key={index}
                className="whitespace-nowrap px-6 font-mono text-[10px] uppercase tracking-[0.18em]"
              >
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
