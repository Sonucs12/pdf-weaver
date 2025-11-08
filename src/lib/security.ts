export const MAX_PAGES_ALLOWED = 5;
export const MAX_PDF_GENERATIONS = 15;
export const MAX_FILE_SIZE_MB = 15;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function canSelectMorePages(selectedPages: number): boolean {
  return selectedPages < MAX_PAGES_ALLOWED;
}

export function isFileSizeAllowed(fileSize: number): boolean {
  return fileSize <= MAX_FILE_SIZE_BYTES;
}