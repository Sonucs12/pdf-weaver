export const MAX_PAGES_ALLOWED = 5;
export const MAX_PDF_GENERATIONS = 1;

export function canSelectMorePages(selectedPages: number): boolean {
  return selectedPages < MAX_PAGES_ALLOWED;
}

export function getGenerationCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem('pdfGenerationCount');
  return count ? parseInt(count, 10) : 0;
}

export function incrementGenerationCount(): void {
  if (typeof window === 'undefined') return;
  const currentCount = getGenerationCount();
  localStorage.setItem('pdfGenerationCount', (currentCount + 1).toString());
}
