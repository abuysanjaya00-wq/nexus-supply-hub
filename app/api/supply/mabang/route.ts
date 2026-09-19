import { NextResponse } from "next/server";
import { buildMabangWorkbook, getActiveMabangHeaders } from "@/lib/mabang";
import { getSupplySkusByIds, listSupplySkus } from "@/lib/supply-store";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const body = (await request.json()) as { ids?: string[] };
  const skus =
    body.ids && body.ids.length > 0
      ? await getSupplySkusByIds(body.ids)
      : await listSupplySkus();
  if (skus.length === 0) {
    return NextResponse.json({ error: "没有可导出的 SKU" }, { status: 400 });
  }

  const { headers } = await getActiveMabangHeaders();
  const file = buildMabangWorkbook(skus, headers);
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="mabang-stock-sku.xlsx"',
    },
  });
}
