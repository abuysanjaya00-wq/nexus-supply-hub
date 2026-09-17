import type { SupplyMode } from "@/lib/products";
import {
  parseProductsFromCsvText,
  type SpreadsheetProductInput,
} from "@/lib/spreadsheet-import";

/** @deprecated Import from `@/lib/spreadsheet-import` instead */
export type CsvProductInput = SpreadsheetProductInput;

/** @deprecated Prefer parseProductsFromCsvText / parseProductsByFilename */
export function parseProductsCsv(text: string): SpreadsheetProductInput[] {
  return parseProductsFromCsvText(text);
}

export type { SupplyMode };
