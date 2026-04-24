import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";

import { slugifyHeading } from "@/lib/mdx-navigation";

type AlgorithmMdxProps = {
  source: string;
};

function flattenText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return flattenText(child.props.children);
      }

      return "";
    })
    .join("")
    .trim();
}

function headingId(children: ReactNode) {
  const title = flattenText(children);
  return slugifyHeading(title);
}

function codeLanguageLabel(className?: string) {
  const language = className?.replace("language-", "").toLowerCase();

  if (!language) {
    return "Code";
  }

  if (language === "js") {
    return "JavaScript";
  }

  if (language === "ts") {
    return "TypeScript";
  }

  return language.charAt(0).toUpperCase() + language.slice(1);
}

const mdxComponents = {
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
    <h2
      id={headingId(children)}
      className="scroll-mt-24 mt-10 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
    <h3
      id={headingId(children)}
      className="scroll-mt-24 mt-7 text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]"
      {...props}
    >
      {children}
    </h3>
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--muted)] sm:text-base" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--muted)] sm:text-base" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => <li {...props} />,
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => {
    let languageLabel = "Code";

    if (isValidElement<{ className?: string }>(children)) {
      languageLabel = codeLanguageLabel(children.props.className);
    }

    return (
      <div className="mt-5 overflow-hidden rounded-[24px] border border-black/10 bg-[#0f1726] shadow-[0_20px_60px_-30px_rgba(15,23,38,0.8)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-white/70">
          <span>{languageLabel}</span>
          <span>Reference implementation</span>
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-white" {...props}>
          {children}
        </pre>
      </div>
    );
  },
  code: (props: React.ComponentProps<"code">) => {
    const inline = !props.className;

    if (inline) {
      return (
        <code
          className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[0.92em] text-[var(--accent-strong)]"
          {...props}
        />
      );
    }

    return <code className="font-mono text-[0.95em] text-white" {...props} />;
  },
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="mt-5 rounded-[24px] border border-[var(--accent)]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,243,221,0.98))] px-5 py-4 text-sm leading-7 text-[var(--foreground)] shadow-[0_20px_60px_-40px_rgba(184,92,56,0.7)]"
      {...props}
    />
  ),
};

export function AlgorithmMdx({ source }: AlgorithmMdxProps) {
  return (
    <section className="glass-panel rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Reference Notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Interview-ready walkthrough
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
          Use the anchors and code examples below to jump straight to the explanation, implementation, and pitfalls.
        </p>
      </div>
      <div className="mt-6">
        <MDXRemote source={source} components={mdxComponents} />
      </div>
    </section>
  );
}