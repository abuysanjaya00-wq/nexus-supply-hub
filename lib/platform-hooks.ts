import type { StorePlatform } from "@/lib/types";
import type { DropshipOrder } from "@/lib/types";

/**
 * Platform tracking push-back hooks (skeletons).
 * Replace each body with real marketplace API calls when credentials are ready.
 */
export async function pushTrackingToPlatform(order: DropshipOrder): Promise<{
  ok: boolean;
  platform: string;
  message: string;
}> {
  const platform = (order.platform || "unknown").toLowerCase() as
    | StorePlatform
    | "unknown";

  switch (platform) {
    case "etsy":
      // TODO: POST tracking to Etsy Receipts API
      return {
        ok: true,
        platform,
        message: `[skeleton] Would push ${order.tracking_number} to Etsy order ${order.platform_order_id}`,
      };
    case "shopify":
      return {
        ok: true,
        platform,
        message: `[skeleton] Would create Shopify fulfillment for ${order.platform_order_id}`,
      };
    case "tiktok":
      return {
        ok: true,
        platform,
        message: `[skeleton] Would call TikTok Shop logistics ship API`,
      };
    case "temu":
      return {
        ok: true,
        platform,
        message: `[skeleton] Would submit Temu shipping confirmation`,
      };
    case "amazon":
      return {
        ok: true,
        platform,
        message: `[skeleton] Would confirm Amazon shipment via SP-API`,
      };
    case "ebay":
      return {
        ok: true,
        platform,
        message: `[skeleton] Would complete eBay fulfill order`,
      };
    default:
      return {
        ok: true,
        platform: String(platform),
        message: `[skeleton] No platform binding — tracking saved locally only`,
      };
  }
}
