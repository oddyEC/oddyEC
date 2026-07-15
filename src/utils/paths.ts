export function withBase(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }
  if (path.startsWith("#")) return path;

  const base = import.meta.env.BASE_URL || "/";
  if (path === "/") return base;

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}` || normalizedPath;
}

export function entrySlug(id: string): string {
  return id.replace(/\.(md|mdx)$/, "").replace(/\/index$/, "");
}

export function absoluteUrl(path: string, site: URL | undefined): string {
  const fallbackSite = "https://YOUR_SITE_URL";
  return new URL(withBase(path), site?.toString() || fallbackSite).toString();
}
