import {
  CATEGORY_PRESETS,
  inferCategory,
  type SupplyCategory,
} from "@/lib/supply-shared";

export type ScrapedSource = {
  name_cn: string;
  image_url: string;
  cost_rmb: number;
  category: SupplyCategory;
  source_url: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return "";
}

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1"
  ) {
    return true;
  }
  return /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(
    host,
  );
}

export function assertPublicSupplierUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("请输入完整的 http(s) 产品链接");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("只支持 http 或 https 链接");
  }
  if (isPrivateHost(url.hostname)) {
    throw new Error("不允许抓取内网或本机地址");
  }
  return url.toString();
}

export async function scrapeSupplierUrl(
  rawUrl: string,
  categoryHint: SupplyCategory | "auto" = "auto",
): Promise<ScrapedSource> {
  const source_url = assertPublicSupplierUrl(rawUrl);
  const response = await fetch(source_url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`链接无法打开（HTTP ${response.status}），可改为手工填写标题和价格`);
  }

  const html = await response.text();
  const title =
    metaContent(html, "og:title") ||
    decodeHtml(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "") ||
    metaContent(html, "keywords");
  const image_url =
    metaContent(html, "og:image") ||
    metaContent(html, "twitter:image") ||
    "";

  const priceMatch =
    html.match(/[¥￥]\s*([0-9]+(?:\.[0-9]{1,2})?)/) ||
    html.match(/"price"\s*:\s*"?([0-9]+(?:\.[0-9]{1,2})?)/i) ||
    html.match(/priceDisplay[^0-9]*([0-9]+(?:\.[0-9]{1,2})?)/i);

  const name_cn = title
    .replace(/[-_|].*(1688|阿里巴巴|淘宝|天猫).*$/i, "")
    .replace(/\s*-\s*阿里巴巴.*$/i, "")
    .trim()
    .slice(0, 120);

  if (!name_cn) {
    throw new Error("没有解析到中文标题。1688 可能拦截了抓取，请手工补标题后再保存");
  }

  const category =
    categoryHint === "auto" ? inferCategory(`${name_cn} ${source_url}`) : categoryHint;

  return {
    name_cn,
    image_url,
    cost_rmb: priceMatch ? Number(priceMatch[1]) : 0,
    category,
    source_url,
  };
}

export function applyCategoryDefaults(
  category: SupplyCategory,
  cost_rmb: number,
) {
  const preset = CATEGORY_PRESETS[category];
  return {
    ...preset,
    category,
    cost_rmb,
    moq: 1,
    msrp_usd: 0,
  };
}
