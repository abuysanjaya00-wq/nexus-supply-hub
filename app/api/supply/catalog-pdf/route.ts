import { NextResponse } from "next/server";
import { buildCatalogPdf } from "@/lib/catalog-pdf";
import { getSupplySkusByIds } from "@/lib/supply-store";
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
  if (!body.ids?.length) {
    return NextResponse.json({ error: "请先勾选 SKU" }, { status: 400 });
  }

  const skus = await getSupplySkusByIds(body.ids);
  const file = await buildCatalogPdf(skus);
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="nexus-whatsapp-lookbook.pdf"',
    },
  });
}
