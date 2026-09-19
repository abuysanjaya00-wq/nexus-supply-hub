import { promises as fs } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { MABANG_DEFAULT_HEADERS } from "@/lib/mabang-default-headers";
import { createServiceClient } from "@/lib/supabase/server";
import {
  CATEGORY_PRESETS,
  type SupplySku,
} from "@/lib/supply-shared";

const SETTINGS_KEY = "mabang_headers";
const LOCAL_FILE = path.join(process.cwd(), "data", "mabang-headers.json");

export type HeaderSource = "uploaded" | "builtin";

function cleanHeaders(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function looksLikeMabang(headers: string[]) {
  return headers.some((header) => header.includes("库存sku编号"));
}

export function headersFromTemplateBuffer(buffer: Buffer): string[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("模板里没有工作表");
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
    workbook.Sheets[sheetName],
    { header: 1, defval: "", blankrows: false },
  );
  const headers = cleanHeaders(rows[0]);
  if (!looksLikeMabang(headers)) {
    throw new Error("未识别到 *库存sku编号，请上传马帮库存SKU官方模板");
  }
  return headers;
}

async function readLocalHeaders(): Promise<string[] | null> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as { headers?: unknown };
    const headers = cleanHeaders(parsed.headers);
    return looksLikeMabang(headers) ? headers : null;
  } catch {
    return null;
  }
}

async function writeLocalHeaders(headers: string[]) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(
    LOCAL_FILE,
    JSON.stringify({ headers, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

export async function getActiveMabangHeaders(): Promise<{
  headers: string[];
  source: HeaderSource;
  count: number;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("supply_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    if (!error && data?.value) {
      const value = data.value as { headers?: unknown };
      const headers = cleanHeaders(value.headers);
      if (looksLikeMabang(headers)) {
        return { headers, source: "uploaded", count: headers.length };
      }
    }
  } catch {
    // fall through
  }

  const local = await readLocalHeaders();
  if (local) {
    return { headers: local, source: "uploaded", count: local.length };
  }

  return {
    headers: [...MABANG_DEFAULT_HEADERS],
    source: "builtin",
    count: MABANG_DEFAULT_HEADERS.length,
  };
}

export async function saveMabangHeaders(headers: string[]) {
  if (!looksLikeMabang(headers)) {
    throw new Error("表头无效");
  }

  try {
    await writeLocalHeaders(headers);
  } catch {
    // Vercel filesystem may be read-only; database remains the source of truth.
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("supply_settings").upsert(
    {
      key: SETTINGS_KEY,
      value: { headers, updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw error;
}

function matches(header: string, token: string) {
  return header.replace(/\s/g, "").includes(token);
}

function assign(
  row: string[],
  headers: string[],
  token: string,
  value: string | number,
) {
  const index = headers.findIndex((header) => matches(header, token));
  if (index >= 0 && (row[index] === undefined || row[index] === "")) {
    row[index] = String(value);
  }
}

export function skuToMabangRow(sku: SupplySku, headers: string[]): string[] {
  const preset = CATEGORY_PRESETS[sku.category] ?? CATEGORY_PRESETS.home;
  const row = headers.map(() => "");
  const saleRmb = sku.cost_rmb > 0 ? (sku.cost_rmb * 2.4).toFixed(2) : "";
  const declareUsd =
    sku.cost_rmb > 0 ? Math.max(1, sku.cost_rmb / 7.2 / 3).toFixed(2) : "1.00";
  const now = new Date();
  const stamp = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  assign(row, headers, "库存sku编号", sku.sku);
  assign(row, headers, "主SKU编号", sku.sku);
  assign(row, headers, "库存sku中文名称", sku.name_cn);
  assign(row, headers, "库存sku英文名称", sku.etsy_title || sku.name_en);
  assign(row, headers, "sku状态", "正常销售");
  assign(row, headers, "统一成本价", sku.cost_rmb || "");
  assign(row, headers, "标准采购价", sku.cost_rmb || "");
  assign(row, headers, "最新采购价", sku.cost_rmb || "");
  assign(row, headers, "最低采购价格", sku.cost_rmb || "");
  assign(row, headers, "上次采购价格", sku.cost_rmb || "");
  assign(row, headers, "供应商报价", sku.cost_rmb || "");
  assign(row, headers, "仓库成本价", sku.cost_rmb || "");
  assign(row, headers, "售价(RMB)", saleRmb);
  assign(row, headers, "产品细节图", sku.image_url);
  assign(row, headers, "库存图片地址", sku.image_url);
  assign(row, headers, "商品目录", preset.declare_name_cn);
  assign(row, headers, "申报品名(中文)", sku.declare_name_cn || preset.declare_name_cn);
  assign(row, headers, "申报品名(英文)", sku.declare_name_en || preset.declare_name_en);
  assign(row, headers, "产品销售链接", sku.source_url);
  assign(row, headers, "供应商商品网址", sku.source_url);
  assign(row, headers, "商品重量", sku.weight_g || preset.weight_g);
  assign(row, headers, "包装后尺寸长", sku.pack_length_cm || preset.pack_length_cm);
  assign(row, headers, "包装后尺寸宽", sku.pack_width_cm || preset.pack_width_cm);
  assign(row, headers, "包装后尺寸高", sku.pack_height_cm || preset.pack_height_cm);
  assign(row, headers, "包装后重量", sku.pack_weight_kg || preset.pack_weight_kg);
  assign(row, headers, "商品尺寸长", sku.pack_length_cm || preset.pack_length_cm);
  assign(row, headers, "商品尺寸宽", sku.pack_width_cm || preset.pack_width_cm);
  assign(row, headers, "商品尺寸高", sku.pack_height_cm || preset.pack_height_cm);
  assign(row, headers, "商品材质", sku.material || preset.material);
  assign(row, headers, "商品用途", preset.usage);
  assign(row, headers, "原厂SKU", sku.sku);
  assign(row, headers, "最小采购数量", sku.moq || 1);
  assign(row, headers, "申报价格", declareUsd);
  assign(row, headers, "报关编码", sku.hs_code || preset.hs_code);
  assign(row, headers, "原产国", "中国");
  assign(row, headers, "货物原产地", "中国");
  assign(row, headers, "境内货源地", "浙江");
  assign(row, headers, "带电池", "否");
  assign(row, headers, "侵权", "否");
  assign(row, headers, "粉末", "否");
  assign(row, headers, "带磁", "否");
  assign(row, headers, "膏体", "否");
  assign(row, headers, "是否刀具", "否");
  assign(row, headers, "是否易燃品", "否");
  assign(row, headers, "液体化妆品", "非液体");
  assign(row, headers, "单位", "个");
  assign(row, headers, "创建时间", stamp);
  assign(row, headers, "毛重", sku.pack_weight_kg || preset.pack_weight_kg);
  assign(row, headers, "商品备注", sku.etsy_title ? `Etsy: ${sku.etsy_title}` : "");
  assign(row, headers, "销售备注", sku.tags.join(", "));
  return row;
}

export function buildMabangWorkbook(skus: SupplySku[], headers: string[]) {
  const aoa = [headers, ...skus.map((sku) => skuToMabangRow(sku, headers))];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  sheet["!cols"] = headers.map((header) => ({
    wch: Math.min(28, Math.max(12, header.length)),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "库存sku上传模板");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
