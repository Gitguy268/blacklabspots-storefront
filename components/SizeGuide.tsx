import type { SizeGuide as SizeGuideType } from "@/lib/types";

function convert(value: string, units: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  if (units === "length") return (number / 10).toFixed(1);
  return String(number);
}

export function SizeGuide({ guide }: { guide: SizeGuideType | null }) {
  if (!guide || !Array.isArray(guide.types) || !guide.types.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th className="py-2 pr-3 font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-smoke">
              Measurement
            </th>
            {guide.sizes.map((size) => (
              <th
                key={size}
                className="px-2 py-2 text-center font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-smoke"
              >
                {size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guide.types.map((type) => (
            <tr key={type.name} className="border-b border-line/70">
              <td className="py-2 pr-3 text-[11px] text-smoke">
                {type.name}
                {type.units === "length" ? " (cm)" : ""}
              </td>
              {type.ranges.map((range, index) => (
                <td
                  key={`${type.name}-${index}`}
                  className="px-2 py-2 text-center font-mono text-[10px] tabular-nums"
                >
                  {convert(range.from, type.units)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-smoke">
        Measurements are approximate. When between sizes, size up for a relaxed fit.
      </p>
    </div>
  );
}
