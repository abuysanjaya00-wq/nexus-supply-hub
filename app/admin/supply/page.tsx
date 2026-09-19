import Link from "next/link";
import SignOutButton from "@/app/components/sign-out-button";
import SupplyConsole from "./supply-console";
import { getActiveMabangHeaders } from "@/lib/mabang";
import { listSupplySkus } from "@/lib/supply-store";

export const dynamic = "force-dynamic";

export default async function SupplyHubPage() {
  let skus: Awaited<ReturnType<typeof listSupplySkus>> = [];
  let error: string | null = null;
  let template = { count: 99, source: "builtin" as "uploaded" | "builtin" };

  try {
    template = await getActiveMabangHeaders();
    skus = await listSupplySkus();
  } catch (err) {
    error = err instanceof Error ? err.message : "供应链档案暂时不可用";
  }

  return (
    <div className="min-h-screen bg-[#F6F0E8] text-[#2C241B]">
      <header className="border-b border-[#E5D6C5] bg-[#FBF7F1]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <Link href="/" className="text-sm font-semibold text-[#C45C26]">
              Nexus Supply
            </Link>
            <p className="text-xs text-[#8B735E]">供应链与马帮中台</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin/upload" className="text-[#6B5646]">
              表格导入
            </Link>
            <Link href="/products" className="text-[#6B5646]">
              选品中心
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          供应链中台
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#6B5646]">
          粘贴源头链接，生成马帮库存 SKU 表，写好 Etsy 文案，再把本周主推导出 WhatsApp 画册。
        </p>
        {error ? (
          <div className="mt-4 rounded-xl border border-[#E8B4A2] bg-[#FDF2EC] p-4 text-sm text-[#8B3E28]">
            <p>{error}</p>
            <p className="mt-2">
              请先在 Supabase 执行{" "}
              <code className="font-mono">sql/phase7-supply-hub.sql</code>
              ，并配置 SUPABASE_SERVICE_ROLE_KEY。
            </p>
          </div>
        ) : null}
        <div className="mt-6">
          <SupplyConsole
            initialSkus={skus}
            templateCount={template.count}
            templateSource={template.source}
          />
        </div>
      </main>
    </div>
  );
}
