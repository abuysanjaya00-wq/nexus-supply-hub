import HubShell from "@/app/components/hub-shell";
import { listProducts } from "@/lib/products";
import { listResellerStores } from "@/lib/stores";
import NewOrderForm from "./new-order-form";

export default async function NewOrderPage() {
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  let stores: Awaited<ReturnType<typeof listResellerStores>> = [];
  let error: string | null = null;

  try {
    [products, stores] = await Promise.all([
      listProducts(),
      listResellerStores(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load order form";
  }

  return (
    <HubShell
      activePath="/reseller/orders/new"
      title="一件代发下单"
      subtitle="小 B 卖家选择供应链 SKU，填写 C 端买家地址，提交后进入仓库 fulfillment 队列。"
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <NewOrderForm products={products} stores={stores} />
    </HubShell>
  );
}
