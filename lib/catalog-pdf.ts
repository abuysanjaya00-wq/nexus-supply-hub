import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { SupplySku } from "@/lib/supply-shared";

const CREAM = rgb(0.965, 0.941, 0.91);
const INK = rgb(0.173, 0.141, 0.106);
const CLAY = rgb(0.769, 0.361, 0.149);
const MUTED = rgb(0.42, 0.337, 0.275);

async function embedImage(pdf: PDFDocument, url: string) {
  if (!url.startsWith("http")) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return pdf.embedPng(bytes);
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return pdf.embedJpg(bytes);
    return null;
  } catch {
    return null;
  }
}

function wrap(text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 6);
}

export async function buildCatalogPdf(skus: SupplySku[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (const sku of skus) {
    const page = pdf.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: CREAM,
    });
    page.drawRectangle({
      x: 0,
      y: height - 36,
      width,
      height: 36,
      color: CLAY,
    });
    page.drawText("NEXUS  ·  CHAIN LEADER HOME  ·  WHATSAPP LOOKBOOK", {
      x: 36,
      y: height - 23,
      size: 11,
      font: bold,
      color: rgb(1, 0.973, 0.949),
    });

    const image = await embedImage(pdf, sku.image_url);
    if (image) {
      page.drawImage(image, { x: 42, y: 78, width: 340, height: 430 });
    } else {
      page.drawRectangle({
        x: 42,
        y: 78,
        width: 340,
        height: 430,
        color: rgb(0.91, 0.86, 0.8),
      });
      page.drawText("IMAGE", {
        x: 180,
        y: 280,
        size: 14,
        font: bold,
        color: MUTED,
      });
    }

    const title = (sku.etsy_title || sku.name_en || sku.name_cn || sku.sku).slice(
      0,
      90,
    );
    let y = height - 78;
    for (const line of wrap(title, 34)) {
      page.drawText(line, { x: 410, y, size: 18, font: bold, color: INK });
      y -= 24;
    }

    y -= 10;
    page.drawText(`SKU  ${sku.sku}`, {
      x: 410,
      y,
      size: 12,
      font,
      color: MUTED,
    });
    y -= 28;
    page.drawText("WHOLESALE", {
      x: 410,
      y,
      size: 9,
      font,
      color: MUTED,
    });
    y -= 22;
    page.drawText(`USD ${sku.msrp_usd.toFixed(2)} MSRP`, {
      x: 410,
      y,
      size: 16,
      font: bold,
      color: CLAY,
    });
    y -= 20;
    page.drawText(`Cost floor RMB ${sku.cost_rmb.toFixed(2)}`, {
      x: 410,
      y,
      size: 11,
      font,
      color: INK,
    });
    y -= 28;
    page.drawText(`MOQ  ${sku.moq || 1} pc`, {
      x: 410,
      y,
      size: 13,
      font: bold,
      color: INK,
    });
    y -= 28;
    const blurb = wrap(sku.etsy_description || sku.material || "Dropship ready.", 42);
    for (const line of blurb) {
      page.drawText(line, { x: 410, y, size: 10, font, color: MUTED });
      y -= 14;
    }
  }

  if (skus.length === 0) {
    const page = pdf.addPage([841.89, 595.28]);
    page.drawText("No SKUs selected", { x: 48, y: 300, size: 18, font });
  }

  return Buffer.from(await pdf.save());
}
