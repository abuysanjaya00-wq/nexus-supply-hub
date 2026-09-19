import HubShell from "@/app/components/hub-shell";
import { listResellerStores } from "@/lib/stores";
import StoresManager from "./stores-manager";

export default async function ResellerStoresPage() {
  let stores: Awaited<ReturnType<typeof listResellerStores>> = [];
  let error: string | null = null;
  try {
    stores = await listResellerStores();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load stores";
  }

  return (
    <HubShell
      activePath="/reseller/stores"
      title="多平台店铺绑定"
      subtitle="连接 Etsy、Shopify、TikTok Shop、Temu、Amazon、eBay，管理 API 授权与店铺状态，为订单同步与单号回传做准备。"
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
          <p className="mt-2 text-rose-600">
            请先在 Supabase 执行{" "}
            <code className="font-mono">sql/phase6-s2b2c-dropship.sql</code>
          </p>
        </div>
      ) : null}
      <StoresManager initialStores={stores} />
    </HubShell>
  );
}
