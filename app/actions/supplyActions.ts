"use server";

import { revalidatePath } from "next/cache";
import { generateEtsyPack } from "@/lib/etsy-pack";
import {
  getActiveMabangHeaders,
  headersFromTemplateBuffer,
  saveMabangHeaders,
  type HeaderSource,
} from "@/lib/mabang";
import {
  applyCategoryDefaults,
  scrapeSupplierUrl,
} from "@/lib/source-scrape";
import { insertSupplySku, listSupplySkus, saveEtsyPack } from "@/lib/supply-store";
import type { SupplyCategory, SupplySku } from "@/lib/supply-shared";
import { createClient } from "@/lib/supabase/server";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("请先登录");
  return user;
}

export async function scrapeSupplyAction(input: {
  url: string;
  category: SupplyCategory | "auto";
  name_cn?: string;
  cost_rmb?: number;
}): Promise<ActionResult<SupplySku>> {
  try {
    await requireUser();
    let scraped;
    try {
      scraped = await scrapeSupplierUrl(input.url, input.category);
    } catch (error) {
      if (!input.name_cn?.trim()) {
        throw error;
      }
      const category =
        input.category === "auto" ? "home" : input.category;
      scraped = {
        name_cn: input.name_cn.trim(),
        image_url: "",
        cost_rmb: Number(input.cost_rmb) || 0,
        category,
        source_url: input.url.trim(),
      };
    }

    if (input.name_cn?.trim()) scraped.name_cn = input.name_cn.trim();
    if (input.cost_rmb && input.cost_rmb > 0) scraped.cost_rmb = input.cost_rmb;
    if (input.category !== "auto") scraped.category = input.category;
    applyCategoryDefaults(scraped.category, scraped.cost_rmb);

    const sku = await insertSupplySku(scraped);
    revalidatePath("/admin/supply");
    return { ok: true, data: sku };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "抓取失败",
    };
  }
}

export async function uploadMabangTemplateAction(
  formData: FormData,
): Promise<ActionResult<{ count: number; source: HeaderSource }>> {
  try {
    await requireUser();
    const file = formData.get("template");
    if (!(file instanceof File)) {
      return { ok: false, error: "请选择 .xlsx 模板" };
    }
    const headers = headersFromTemplateBuffer(Buffer.from(await file.arrayBuffer()));
    await saveMabangHeaders(headers);
    revalidatePath("/admin/supply");
    return { ok: true, data: { count: headers.length, source: "uploaded" } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "模板更新失败",
    };
  }
}

export async function generateEtsyPackAction(
  id: string,
): Promise<ActionResult<SupplySku>> {
  try {
    await requireUser();
    const rows = await listSupplySkus();
    const sku = rows.find((row) => row.id === id);
    if (!sku) return { ok: false, error: "找不到该 SKU" };
    const pack = await generateEtsyPack({
      name_cn: sku.name_cn,
      category: sku.category,
      cost_rmb: sku.cost_rmb,
      material: sku.material,
    });
    const saved = await saveEtsyPack(id, pack);
    revalidatePath("/admin/supply");
    return { ok: true, data: saved };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "文案生成失败",
    };
  }
}

export async function templateStatusAction(): Promise<
  ActionResult<{ count: number; source: HeaderSource }>
> {
  try {
    const active = await getActiveMabangHeaders();
    return {
      ok: true,
      data: { count: active.count, source: active.source },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "无法读取模板",
    };
  }
}
