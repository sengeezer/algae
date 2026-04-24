export type MdxHeading = {
  id: string;
  title: string;
  level: 2 | 3;
};

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractMdxHeadings(source: string): MdxHeading[] {
  const matches = source.matchAll(/^(##|###)\s+(.+)$/gm);

  return Array.from(matches, ([, hashes, rawTitle]) => {
    const title = rawTitle.trim().replace(/[`*_~]/g, "");

    return {
      id: slugifyHeading(title),
      title,
      level: hashes.length as 2 | 3,
    };
  });
}