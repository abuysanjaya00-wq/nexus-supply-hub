"use server";

import { revalidatePath } from "next/cache";
import { generateEtsyListing, type AiListingResult } from "@/lib/ai-listing";
import {
  getProductById,
  listCategories,
  listProducts,
  mapProduct,
  type Product,
  type ProductFilters,
} from "@/lib/products";
import {
  parseProductsByFilename,
  type SpreadsheetProductInput,
} from "@/lib/spreadsheet-import";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const UPSERT_CHUNK = 200;

async function requireUser() {
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  return user;
}

async function upsertProducts(
  rows: SpreadsheetProductInput[],
): Promise<number> {
  const supabase = createServiceClient();
  let total = 0;

  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK);
    const { data, error } = await supabase
      .from("products")
      .upsert(chunk, { onConflict: "sku" })
      .select("id");

    if (error) throw error;
    total += data?.length ?? chunk.length;
  }

  revalidatePath("/products");
  revalidatePath("/admin/upload");
  return total;
}

export async function fetchProductsAction(
  filters: ProductFilters = {},
): Promise<ActionResult<Product[]>> {
  try {
    const data = await listProducts(filters);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to load products",
    };
  }
}

export async function fetchProductCategoriesAction(): Promise<
  ActionResult<string[]>
> {
  try {
    const data = await listCategories();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to load categories",
    };
  }
}

export async function fetchProductByIdAction(
  id: string,
): Promise<ActionResult<Product>> {
  try {
    const product = await getProductById(id);
    if (!product) return { ok: false, error: "Product not found" };
    return { ok: true, data: product };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to load product",
    };
  }
}

export async function generateListingAction(
  productId: string,
): Promise<ActionResult<AiListingResult>> {
  try {
    const product = await getProductById(productId);
    if (!product) return { ok: false, error: "Product not found" };
    const data = await generateEtsyListing(product);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "AI listing generation failed",
    };
  }
}

/**
 * Accepts a FormData file field named `file` (.xlsx / .xls / .csv),
 * parses the first sheet with CN/EN header mapping, upserts by SKU.
 */
export async function importProductsSpreadsheetAction(
  formData: FormData,
): Promise<ActionResult<{ count: number; filename: string }>> {
  try {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "请先登录后再导入商品" };
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "未收到上传文件，请选择 .xlsx / .xls / .csv" };
    }

    const filename = file.name || "upload.xlsx";
    const lower = filename.toLowerCase();
    if (
      !lower.endsWith(".xlsx") &&
      !lower.endsWith(".xls") &&
      !lower.endsWith(".csv")
    ) {
      return {
        ok: false,
        error: "仅支持 .xlsx、.xls 或 .csv 格式的供应链表格",
      };
    }

    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      return { ok: false, error: "文件过大，请控制在 8MB 以内" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = parseProductsByFilename(buffer, filename);
    const count = await upsertProducts(rows);

    return { ok: true, data: { count, filename } };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Spreadsheet import failed",
    };
  }
}

/**
 * Low-level import from an ArrayBuffer / Buffer (first worksheet).
 * Useful for API / script callers.
 */
export async function importProductsFromBufferAction(
  payload: {
    filename: string;
    bytesBase64: string;
  },
): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "请先登录后再导入商品" };
    }

    if (!payload?.bytesBase64 || !payload?.filename) {
      return { ok: false, error: "缺少文件缓冲区或文件名" };
    }

    const buffer = Buffer.from(payload.bytesBase64, "base64");
    const rows = parseProductsByFilename(buffer, payload.filename);
    const count = await upsertProducts(rows);
    return { ok: true, data: { count } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Buffer import failed",
    };
  }
}

/** @deprecated Use importProductsSpreadsheetAction — kept for older clients */
export async function importProductsCsvAction(
  csvText: string,
): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await requireUser();
    if (!user) {
      return { ok: false, error: "请先登录后再导入商品" };
    }

    const { parseProductsFromCsvText } = await import("@/lib/spreadsheet-import");
    const rows = parseProductsFromCsvText(csvText);
    const count = await upsertProducts(rows);
    return { ok: true, data: { count } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "CSV import failed",
    };
  }
}

export async function pingProductsTableAction(): Promise<
  ActionResult<{ sample: Product | null }>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, sku, name, style, specs, weight_g, material, min_price, notes, image_url, category, supply_mode, verified_chain_leader, created_at, updated_at",
      )
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return {
      ok: true,
      data: {
        sample: data
          ? mapProduct(data as Parameters<typeof mapProduct>[0])
          : null,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Ping failed",
    };
  }
}
