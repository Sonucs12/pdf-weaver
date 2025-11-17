import { MAX_PAGES_ALLOWED } from "@/lib/security";
export function parsePageRange(range: string, max: number): number[] | null {
  if (!range.trim()) return null;

  const parts = range.split("-").map((s) => s.trim());

  if (parts.length === 1) {
    const page = parseInt(parts[0], 10);
    if (isNaN(page) || page < 1 || page > max) return null;
    return [page];
  }

  if (parts.length === 2) {
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    if (isNaN(start) || isNaN(end) || start < 1 || end > max || start > end)
      return null;

    if (end - start + 1 > MAX_PAGES_ALLOWED) {
      return null;
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  return null;
}
