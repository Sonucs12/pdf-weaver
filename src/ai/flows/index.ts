'use server';

import { extractTextFromPdfSupabase } from './extractWithSupabase';
import { formatContent } from './automatic-content-formatting';
import { extractAndFormatPages } from './extract-and-format';
export { extractTextFromPdfSupabase, formatContent, extractAndFormatPages };
