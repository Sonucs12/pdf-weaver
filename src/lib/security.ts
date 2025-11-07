export const MAX_PAGES_ALLOWED = 5;
export const MAX_PDF_GENERATIONS = 15;

export function canSelectMorePages(selectedPages: number): boolean {
  return selectedPages < MAX_PAGES_ALLOWED;
}
