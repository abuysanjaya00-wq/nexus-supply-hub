export type ProductListingFields = {
  sku: string;
  name: string;
  style: string;
  specs: string;
  weight_g: number | null;
  material: string;
  min_price: number;
  notes: string;
  category: string;
  english_title: string;
  tags: string;
};

export function formatUsd(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/** Multi-platform listing export payload for copy/download */
export function buildListingExport(product: ProductListingFields) {
  const title = product.english_title || product.name;
  const description = [
    title,
    "",
    product.notes || product.specs,
    "",
    `Material: ${product.material || "—"}`,
    `Style: ${product.style || "—"}`,
    `Specs: ${product.specs || "—"}`,
    product.weight_g != null ? `Weight: ${product.weight_g}g` : null,
    "",
    `SKU: ${product.sku}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const tags = product.tags
    ? product.tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 13)
    : [];

  return {
    title,
    description,
    tags,
    sku: product.sku,
    price: product.min_price,
    category: product.category,
  };
}

/** Full Etsy listing media kit text for one-click copy */
export function buildMediaKitText(product: ProductListingFields & {
  image_url?: string | null;
}) {
  const payload = buildListingExport(product);
  return [
    "=== Nexus Supply · Etsy Media Kit ===",
    `Title: ${payload.title}`,
    "",
    "Description:",
    payload.description,
    "",
    `Tags (copy into Etsy): ${payload.tags.join(", ") || "(generate on product detail)"}`,
    `SKU: ${payload.sku}`,
    `Suggested wholesale floor: $${payload.price.toFixed(2)}`,
    product.image_url ? `Hero image: ${product.image_url}` : null,
    "========================================",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

