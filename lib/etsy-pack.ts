import { CATEGORY_PRESETS, suggestMsrp, type SupplyCategory } from "@/lib/supply-shared";

export type EtsyPack = {
  title: string;
  description: string;
  tags: string[];
  msrp_usd: number;
  source: "openai" | "seo-engine";
};

function clipTag(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
}

function uniqueTags(candidates: string[]) {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const candidate of candidates) {
    const tag = clipTag(candidate);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
    if (tags.length === 13) break;
  }
  const fillers = [
    "handmade gift",
    "etsy seller",
    "unique gift",
    "housewarming",
    "boho decor",
    "minimalist gift",
    "artisan made",
    "small business",
    "gift for her",
    "home accent",
    "wedding gift",
    "custom gift",
    "wholesale ready",
  ];
  for (const filler of fillers) {
    if (tags.length === 13) break;
    if (!seen.has(filler)) {
      seen.add(filler);
      tags.push(filler);
    }
  }
  return tags.slice(0, 13);
}

export function buildSeoPack(input: {
  name_cn: string;
  category: SupplyCategory;
  cost_rmb: number;
  material?: string;
}): EtsyPack {
  const preset = CATEGORY_PRESETS[input.category];
  const material = input.material || preset.material;
  const scene =
    input.category === "baby"
      ? "baby shower"
      : input.category === "jewelry"
        ? "everyday layering"
        : input.category === "pod"
          ? "custom gift"
          : "warm home";

  const title = `${material} ${preset.declare_name_en} — ${scene} handmade gift`
    .replace(/\s+/g, " ")
    .slice(0, 140);

  const description = [
    `A quiet, tactile piece for sellers who want an Etsy listing that feels handmade rather than mass-market.`,
    "",
    `Source name: ${input.name_cn}`,
    `Material: ${material}`,
    `Best for: ${scene}, gifting, and styled product photography.`,
    "",
    "What to tell your buyer",
    "• Ready for dropship or small private-label runs",
    "• Pack photos with natural light and a linen or oak surface",
    "• Mention care, size, and that each piece may vary slightly",
    "",
    "This copy is written for Etsy search: scene first, material second, gift intent last.",
  ].join("\n");

  return {
    title,
    description,
    tags: uniqueTags([
      preset.declare_name_en,
      material,
      scene,
      "handmade",
      "etsy gift",
      input.category === "wood" ? "wood wall art" : "home gift",
      "artisan decor",
      "unique handmade",
    ]),
    msrp_usd: suggestMsrp(input.cost_rmb),
    source: "seo-engine",
  };
}

export async function generateEtsyPack(input: {
  name_cn: string;
  category: SupplyCategory;
  cost_rmb: number;
  material?: string;
}): Promise<EtsyPack> {
  const fallback = buildSeoPack(input);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write Etsy SEO listings. Return JSON only: title (<=140 chars), description (emotional English, short paragraphs), tags (exactly 13 strings, each <=20 chars, lowercase), msrp_usd (number).",
          },
          {
            role: "user",
            content: JSON.stringify({
              chinese_name: input.name_cn,
              category: input.category,
              material: input.material,
              wholesale_rmb: input.cost_rmb,
              hint_msrp: fallback.msrp_usd,
            }),
          },
        ],
      }),
    });
    if (!response.ok) return fallback;
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return fallback;
    const parsed = JSON.parse(content) as {
      title?: string;
      description?: string;
      tags?: string[];
      msrp_usd?: number;
    };
    if (!parsed.title || !parsed.description) return fallback;
    return {
      title: parsed.title.slice(0, 140),
      description: parsed.description,
      tags: uniqueTags(parsed.tags ?? []),
      msrp_usd:
        typeof parsed.msrp_usd === "number" && parsed.msrp_usd > 0
          ? Number(parsed.msrp_usd.toFixed(2))
          : fallback.msrp_usd,
      source: "openai",
    };
  } catch {
    return fallback;
  }
}
