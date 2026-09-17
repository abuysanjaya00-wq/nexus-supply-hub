"use client";

import { useEffect, useState } from "react";
import SignOutButton from "./sign-out-button";
import {
  EMPTY_LISTING_DRAFT,
  loadListingDraft,
  saveListingDraft,
  type ListingDraft,
} from "@/lib/listing-draft";

type FieldKey = keyof ListingDraft;

const FIELDS: {
  key: FieldKey;
  label: string;
  hint: string;
  kind: "input" | "textarea" | "price";
  placeholder: string;
  rows?: number;
}[] = [
  {
    key: "title",
    label: "1. 标题",
    hint: "清晰、可搜索，建议控制在 140 字以内",
    kind: "input",
    placeholder: "例如：Hand-carved Oak Serving Board — Minimal Nordic Style",
  },
  {
    key: "description",
    label: "2. 描述",
    hint: "讲清材质、尺寸、用途与制作故事",
    kind: "textarea",
    placeholder: "写下商品亮点、使用场景、护理方式与发货说明…",
    rows: 6,
  },
  {
    key: "tags",
    label: "3. 标签",
    hint: "用逗号分隔，最多 13 个",
    kind: "input",
    placeholder: "serving board, oak wood, kitchen gift, handmade",
  },
  {
    key: "materials",
    label: "4. 材料",
    hint: "用逗号分隔主要材料",
    kind: "input",
    placeholder: "oak wood, food-safe oil, beeswax",
  },
  {
    key: "personalization",
    label: "5. 个性化",
    hint: "说明是否支持刻字/定制，以及买家需提供的信息",
    kind: "textarea",
    placeholder: "例如：支持刻字，请在结账备注中留下姓名或日期",
    rows: 3,
  },
  {
    key: "suggestedPrice",
    label: "6. 建议价格",
    hint: "以 USD 计，可按成本和竞品微调",
    kind: "price",
    placeholder: "48.00",
  },
  {
    key: "etsyCategory",
    label: "7. Etsy 类别",
    hint: "尽量贴近 Etsy 分类路径",
    kind: "input",
    placeholder: "Home & Living > Kitchen & Dining > Cutting Boards",
  },
];

export default function ListingDraftForm() {
  const [draft, setDraft] = useState<ListingDraft>(EMPTY_LISTING_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">(
    "idle",
  );

  useEffect(() => {
    const stored = loadListingDraft();
    if (stored) setDraft(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (saveState !== "saved") return;
    const timer = window.setTimeout(() => setSaveState("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [saveState]);

  function updateField(key: FieldKey, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaveState("idle");
  }

  function handleSave() {
    try {
      saveListingDraft(draft);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function handleClear() {
    setDraft(EMPTY_LISTING_DRAFT);
    setSaveState("idle");
  }

  return (
    <div className="listing-shell">
      <div className="listing-atmosphere" aria-hidden="true" />

      <header className="listing-hero">
        <div className="listing-hero-top">
          <p className="listing-kicker">Studio draft</p>
          <SignOutButton />
        </div>
        <h1 className="listing-brand">AI Etsy Listing Draft</h1>
        <p className="listing-lede">
          编辑七个核心上架字段，一键保存到本机浏览器，下次打开自动恢复。
        </p>
      </header>

      <form
        className="listing-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        {FIELDS.map((field, index) => (
          <label
            key={field.key}
            className="listing-field"
            style={{ animationDelay: `${120 + index * 55}ms` }}
          >
            <span className="listing-field-label">{field.label}</span>
            <span className="listing-field-hint">{field.hint}</span>
            {field.kind === "textarea" ? (
              <textarea
                name={field.key}
                rows={field.rows}
                value={draft[field.key]}
                onChange={(event) => updateField(field.key, event.target.value)}
                placeholder={field.placeholder}
                disabled={!hydrated}
              />
            ) : field.kind === "price" ? (
              <div className="listing-price">
                <span className="listing-price-prefix">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  name={field.key}
                  value={draft[field.key]}
                  onChange={(event) =>
                    updateField(field.key, event.target.value)
                  }
                  placeholder={field.placeholder}
                  disabled={!hydrated}
                />
              </div>
            ) : (
              <input
                type="text"
                name={field.key}
                value={draft[field.key]}
                onChange={(event) => updateField(field.key, event.target.value)}
                placeholder={field.placeholder}
                disabled={!hydrated}
              />
            )}
          </label>
        ))}

        <div className="listing-actions">
          <button type="submit" className="listing-btn listing-btn-primary">
            保存到 localStorage
          </button>
          <button
            type="button"
            className="listing-btn listing-btn-ghost"
            onClick={handleClear}
          >
            清空表单
          </button>
          <p
            className={`listing-status${
              saveState === "saved"
                ? " is-saved"
                : saveState === "error"
                  ? " is-error"
                  : ""
            }`}
            role="status"
            aria-live="polite"
          >
            {!hydrated && "正在读取本地草稿…"}
            {hydrated && saveState === "idle" && "未保存的更改会留在当前会话"}
            {hydrated && saveState === "saved" && "已保存，刷新页面后仍可恢复"}
            {hydrated &&
              saveState === "error" &&
              "保存失败，请检查浏览器存储权限"}
          </p>
        </div>
      </form>
    </div>
  );
}
