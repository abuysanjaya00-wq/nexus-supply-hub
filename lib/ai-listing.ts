import type { Product } from "@/lib/products";

export type AiListingResult = {
  title: string;
  description: string;
  tags: string[];
  source: "openai" | "seo-engine";
};

function uniqueTags(candidates: string[], limit = 13): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of candidates) {
    const tag = raw
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 20);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= limit) break;
  }
  return out;
}

function padToThirteen(tags: string[], product: Product): string[] {
  const fillers = [
    "handmade gift",
    "etsy bestseller",
    "home decor",
    "unique gift",
    "artisan made",
    "wedding gift",
    "housewarming",
    "custom gift",
    "small business",
    "gift for her",
    "gift for him",
    "modern decor",
    "boho decor",
    "minimalist style",
    product.category,
    product.material,
    product.style,
    "dropship ready",
    "wholesale supply",
  ];
  return uniqueTags([...tags, ...fillers], 13);
}

/** Deterministic Etsy SEO engine — always returns valid title / description / 13 tags. */
export function generateSeoListing(product: Product): AiListingResult {
  const material = product.material || "premium materials";
  const style = product.style || "artisan";
  const category = product.category || "handmade";
  const specs = product.specs || "carefully finished details";

  const title = [
    product.name.replace(/\s+/g, " ").trim().slice(0, 90),
    style ? `— ${style}` : "",
    material ? `| ${material}` : "",
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);

  const description = [
    `${product.name} is a verified ${category.toLowerCase()} piece crafted for Etsy and DTC brands that need reliable wholesale supply.`,
    "",
    "Why buyers love it",
    `• Style: ${style}`,
    `• Specs: ${specs}`,
    `• Material: ${material}`,
    product.weight_g != null ? `• Weight: ${product.weight_g}g` : null,
    `• Supply mode: ${product.supply_mode}`,
    "",
    "Listing details for your store",
    "This SKU ships from a Verified Chain Leader factory partner. Use the high-res photo kit, keep your title keyword-forward, and pair with lifestyle shots for higher Etsy search conversion.",
    "",
    product.notes
      ? `Seller notes from the factory: ${product.notes}`
      : "Ready for personalized packaging, private label, or dropship fulfillment workflows.",
    "",
    "Care & shipping",
    "Wipe gently with a soft dry cloth. Pack securely for international parcels. Suggested retail markup: 2.2×–3.5× wholesale floor.",
    "",
    `SKU: ${product.sku}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const seedTags = [
    category,
    material,
    style,
    `${material} gift`,
    `${category} decor`,
    "handmade",
    "etsy seller",
    "wholesale",
    product.supply_mode.toLowerCase(),
    specs.split(/[,/|]/)[0] ?? "",
    "gift idea",
    "home accent",
    "artisan craft",
  ];

  return {
    title,
    description,
    tags: padToThirteen(seedTags, product),
    source: "seo-engine",
  };
}

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

function normalizeAiPayload(
  payload: unknown,
  product: Product,
): AiListingResult | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  const rawTags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === "string")
    : typeof data.tags === "string"
      ? data.tags.split(",").map((t) => t.trim())
      : [];

  if (!title || !description) return null;
  return {
    title: title.slice(0, 140),
    description,
    tags: padToThirteen(rawTags, product),
    source: "openai",
  };
}

async function generateWithOpenAI(
  product: Product,
  apiKey: string,
): Promise<AiListingResult | null> {
  const prompt = {
    role: "system",
    content:
      "You are an Etsy SEO copywriter. Return ONLY valid JSON with keys title, description, tags. Title <= 140 chars, keyword-forward. Description is long-form English with short paragraphs and bullets. tags must be exactly 13 short Etsy tags (max 20 chars each, lowercase).",
  };

  const user = {
    role: "user",
    content: `Create an Etsy listing for this wholesale SKU:\n${JSON.stringify(
      {
        sku: product.sku,
        name: product.name,
        style: product.style,
        specs: product.specs,
        weight_g: product.weight_g,
        material: product.material,
        min_price: product.min_price,
        notes: product.notes,
        category: product.category,
        supply_mode: product.supply_mode,
      },
      null,
      2,
    )}`,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      messages: [prompt, user],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) return null;
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(extractJsonBlock(content)) as unknown;
    return normalizeAiPayload(parsed, product);
  } catch {
    return null;
  }
}

/** Prefer OpenAI when configured; always fall back to the local SEO engine. */
export async function generateEtsyListing(
  product: Product,
): Promise<AiListingResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const ai = await generateWithOpenAI(product, apiKey);
      if (ai) return ai;
    } catch {
      // fall through
    }
  }
  return generateSeoListing(product);
}
