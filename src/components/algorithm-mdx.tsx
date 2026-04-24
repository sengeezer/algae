import { MDXRemote } from "next-mdx-remote/rsc";

type AlgorithmMdxProps = {
  source: string;
};

const mdxComponents = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 className="mt-8 text-2xl font-semibold tracking-[-0.03em]" {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em]" {...props} />
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
  pre: (props: React.ComponentProps<"pre">) => (
    <pre className="code-surface mt-4 overflow-x-auto rounded-[24px] p-4 text-sm leading-7" {...props} />
  ),
  code: (props: React.ComponentProps<"code">) => {
    const inline = !props.className;

    if (inline) {
      return (
        <code
          className="rounded bg-black/6 px-1.5 py-0.5 font-mono text-[0.92em] text-[var(--foreground)]"
          {...props}
        />
      );
    }

    return <code className="font-mono" {...props} />;
  },
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="mt-4 rounded-[22px] border-l-4 border-[var(--accent)] bg-white/70 px-4 py-3 text-sm leading-7 text-[var(--foreground)]"
      {...props}
    />
  ),
};

export function AlgorithmMdx({ source }: AlgorithmMdxProps) {
  return (
    <section className="glass-panel rounded-[28px] p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        Reference Notes
      </p>
      <div className="mt-4">
        <MDXRemote source={source} components={mdxComponents} />
      </div>
    </section>
  );
}