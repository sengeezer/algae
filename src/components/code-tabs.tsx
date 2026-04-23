"use client";

import { useState } from "react";

import type { CodeVariant } from "@/types/algorithm";

type CodeTabsProps = {
  variants: CodeVariant[];
};

export function CodeTabs({ variants }: CodeTabsProps) {
  const [activeLabel, setActiveLabel] = useState(variants[0]?.label ?? "");

  const activeVariant =
    variants.find((variant) => variant.label === activeLabel) ?? variants[0];

  if (!activeVariant) {
    return null;
  }

  return (
    <section className="glass-panel overflow-hidden rounded-[28px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Code Examples
          </p>
          <h2 className="mt-1 text-xl font-semibold">JavaScript and TypeScript only</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isActive = variant.label === activeVariant.label;

            return (
              <button
                key={variant.label}
                type="button"
                onClick={() => setActiveLabel(variant.label)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--accent)] text-white"
                    : "pill text-[var(--foreground)] hover:border-[var(--accent)]"
                }`}
              >
                {variant.language}
              </button>
            );
          })}
        </div>
      </div>
      <div className="code-surface overflow-x-auto px-5 py-4">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-emerald-100/70">
          {activeVariant.label}
        </p>
        <pre className="overflow-x-auto text-sm leading-7">
          <code className="font-mono">{activeVariant.code}</code>
        </pre>
      </div>
    </section>
  );
}