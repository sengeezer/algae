import { Children } from "react";
import type { ReactNode } from "react";

type CalloutTone = "note" | "tip" | "warning";

type CalloutProps = {
  children: ReactNode;
  title: string;
  tone?: CalloutTone;
};

type ExamplePairProps = {
  children: ReactNode;
};

const calloutStyles: Record<CalloutTone, string> = {
  note: "border-sky-500/20 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.96))] shadow-[0_24px_60px_-42px_rgba(14,116,144,0.75)]",
  tip: "border-emerald-500/20 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(255,255,255,0.96))] shadow-[0_24px_60px_-42px_rgba(5,150,105,0.75)]",
  warning: "border-amber-500/20 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] shadow-[0_24px_60px_-42px_rgba(217,119,6,0.75)]",
};

export function Callout({ children, title, tone = "note" }: CalloutProps) {
  return (
    <aside
      className={`mt-5 rounded-[26px] border px-5 py-4 text-[var(--foreground)] ${calloutStyles[tone]}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
        {title}
      </p>
      <div className="mt-2 text-sm leading-7 text-[var(--foreground)] [&>p:first-child]:mt-0 [&_code]:rounded-full [&_code]:bg-white/80 [&_code]:px-2 [&_code]:py-0.5 [&_code]:text-[var(--accent-strong)]">
        {children}
      </div>
    </aside>
  );
}

export function ExamplePair({ children }: ExamplePairProps) {
  const panels = Children.toArray(children).filter(Boolean);

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {panels.map((panel, index) => (
        <div
          key={typeof panel === "string" ? `${panel}-${index}` : index}
          className="rounded-[28px] border border-black/8 bg-white/45 p-3 shadow-[0_20px_50px_-40px_rgba(15,23,38,0.45)] [&_.mdx-code-surface]:mt-0"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}