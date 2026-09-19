import * as XLSX from "xlsx";
import type { SupplyMode } from "@/lib/products-shared";

export type SpreadsheetProductInput = {
  image_url: string;
  sku: string;
  name: string;
  style: string;
  specs: string;
  weight_g: number | null;
  material: string;
  min_price: number;
  notes: string;
  category: string;
  supply_mode: SupplyMode;
  verified_chain_leader: boolean;
  stock: number;
  english_title: string;
  tags: string;
};

/** Canonical DB field → accepted Chinese / English header aliases */
const HEADER_ALIASES: Record<keyof SpreadsheetProductInput | "price", string[]> =
  {
    sku: ["sku", "skuid", "货号", "商品编码", "产品编码", "编码", "料号"],
    name: [
      "name",
      "title",
      "product name",
      "商品名称",
      "品名",
      "产品名称",
      "名称",
    ],
    style: ["style", "款式", "风格", "样式"],
    specs: ["specs", "spec", "specification", "规格", "尺寸规格", "参数"],
    weight_g: [
      "weight_g",
      "weight",
      "weight(g)",
      "重量",
      "重量(克)",
      "重量克",
      "克重",
      "净重",
    ],
    material: ["material", "materials", "材质", "材料", "原料"],
    min_price: [
      "min_price",
      "price",
      "wholesale",
      "最低售价",
      "售价",
      "批发价",
      "价格",
      "单价",
      "出厂价",
    ],
    notes: [
      "notes",
      "note",
      "remark",
      "remarks",
      "description",
      "备注",
      "说明",
      "描述",
    ],
    image_url: [
      "image_url",
      "image",
      "img",
      "photo",
      "图片",
      "图片链接",
      "主图",
      "图片地址",
      "image url",
    ],
    category: ["category", "categories", "品类", "分类", "类目", "类别"],
    supply_mode: [
      "supply_mode",
      "supply mode",
      "mode",
      "供应模式",
      "供货模式",
      "模式",
    ],
    verified_chain_leader: [
      "verified_chain_leader",
      "verified",
      "认证",
      "链主认证",
    ],
    stock: ["stock", "inventory", "qty", "库存", "库存数量"],
    english_title: [
      "english_title",
      "english title",
      "en_title",
      "英文标题",
      "listing title",
    ],
    tags: ["tags", "tag", "标签", "关键词"],
    price: ["price"],
  };

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function buildHeaderIndex(
  headers: string[],
): Partial<Record<keyof SpreadsheetProductInput, number>> {
  const index: Partial<Record<keyof SpreadsheetProductInput, number>> = {};

  const aliasLookup = new Map<string, keyof SpreadsheetProductInput>();
  (
    Object.entries(HEADER_ALIASES) as Array<[keyof typeof HEADER_ALIASES, string[]]>
  ).forEach(([field, aliases]) => {
    if (field === "price") return;
    aliases.forEach((alias) => {
      aliasLookup.set(normalizeHeader(alias), field);
    });
  });

  headers.forEach((header, i) => {
    const key = normalizeHeader(header);
    const field = aliasLookup.get(key);
    if (field && index[field] === undefined) {
      index[field] = i;
    }
  });

  return index;
}

function cellString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function cellNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[^\d.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseSupplyMode(value: unknown): SupplyMode {
  const raw = cellString(value).toLowerCase();
  if (!raw) return "Dropship Ready";
  if (raw.includes("oem") || raw.includes("定制") || raw.includes("贴牌")) {
    return "OEM";
  }
  return "Dropship Ready";
}

function parseVerified(value: unknown): boolean {
  const raw = cellString(value).toLowerCase();
  if (!raw) return true;
  return !(
    raw === "false" ||
    raw === "0" ||
    raw === "no" ||
    raw === "否" ||
    raw === "n"
  );
}

function mapRowsFromMatrix(matrix: unknown[][]): SpreadsheetProductInput[] {
  if (matrix.length < 2) {
    throw new Error("表格至少需要表头和一行数据");
  }

  const headers = matrix[0].map((h) => cellString(h));
  const index = buildHeaderIndex(headers);

  if (index.sku === undefined) {
    throw new Error(
      "未识别到 SKU 列。请确保表头包含 sku / 货号 / 商品编码 等字段。",
    );
  }

  const products: SpreadsheetProductInput[] = [];

  for (let rowIndex = 1; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex] ?? [];
    const isEmpty = row.every((cell) => cellString(cell) === "");
    if (isEmpty) continue;

    const sku = cellString(row[index.sku!]);
    if (!sku) {
      throw new Error(`第 ${rowIndex + 1} 行缺少 SKU（货号）`);
    }

    const minPrice =
      cellNumber(
        index.min_price !== undefined ? row[index.min_price] : undefined,
      ) ?? 0;

    products.push({
      image_url:
        index.image_url !== undefined ? cellString(row[index.image_url]) : "",
      sku,
      name:
        index.name !== undefined
          ? cellString(row[index.name]) || "Untitled Product"
          : "Untitled Product",
      style: index.style !== undefined ? cellString(row[index.style]) : "",
      specs: index.specs !== undefined ? cellString(row[index.specs]) : "",
      weight_g:
        index.weight_g !== undefined ? cellNumber(row[index.weight_g]) : null,
      material:
        index.material !== undefined ? cellString(row[index.material]) : "",
      min_price: minPrice,
      notes: index.notes !== undefined ? cellString(row[index.notes]) : "",
      category:
        index.category !== undefined
          ? cellString(row[index.category]) || "General"
          : "General",
      supply_mode:
        index.supply_mode !== undefined
          ? parseSupplyMode(row[index.supply_mode])
          : "Dropship Ready",
      verified_chain_leader:
        index.verified_chain_leader !== undefined
          ? parseVerified(row[index.verified_chain_leader])
          : true,
      stock:
        index.stock !== undefined
          ? cellNumber(row[index.stock]) ?? 0
          : 0,
      english_title:
        index.english_title !== undefined
          ? cellString(row[index.english_title])
          : "",
      tags: index.tags !== undefined ? cellString(row[index.tags]) : "",
    });
  }

  if (products.length === 0) {
    throw new Error("表格中没有可导入的商品行");
  }

  return products;
}

/** Parse first worksheet of an .xlsx / .xls buffer. */
export function parseProductsFromSpreadsheetBuffer(
  buffer: Buffer,
): SpreadsheetProductInput[] {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: false,
    raw: false,
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Excel 文件中没有工作表");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  }) as unknown[][];

  return mapRowsFromMatrix(matrix);
}

/** Parse CSV text with the same header-mapping rules. */
export function parseProductsFromCsvText(text: string): SpreadsheetProductInput[] {
  const workbook = XLSX.read(text.replace(/^\uFEFF/, ""), {
    type: "string",
    raw: false,
  });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("CSV 解析失败：未找到有效工作表");
  }
  const sheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  }) as unknown[][];
  return mapRowsFromMatrix(matrix);
}

export function parseProductsByFilename(
  buffer: Buffer,
  filename: string,
): SpreadsheetProductInput[] {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv")) {
    return parseProductsFromCsvText(buffer.toString("utf8"));
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return parseProductsFromSpreadsheetBuffer(buffer);
  }
  // Fallback: try Excel first, then CSV text
  try {
    return parseProductsFromSpreadsheetBuffer(buffer);
  } catch {
    return parseProductsFromCsvText(buffer.toString("utf8"));
  }
}

/** @deprecated Prefer parseProductsFromCsvText — kept for compatibility */
export type CsvProductInput = SpreadsheetProductInput;
export const parseProductsCsv = parseProductsFromCsvText;
