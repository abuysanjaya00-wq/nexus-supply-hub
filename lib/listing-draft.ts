export type ListingDraft = {
  title: string;
  description: string;
  tags: string;
  materials: string;
  personalization: string;
  suggestedPrice: string;
  etsyCategory: string;
};

export const LISTING_DRAFT_STORAGE_KEY = "etsy-listing-draft";

export const EMPTY_LISTING_DRAFT: ListingDraft = {
  title: "",
  description: "",
  tags: "",
  materials: "",
  personalization: "",
  suggestedPrice: "",
  etsyCategory: "",
};

export function isListingDraft(value: unknown): value is ListingDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.title === "string" &&
    typeof draft.description === "string" &&
    typeof draft.tags === "string" &&
    typeof draft.materials === "string" &&
    typeof draft.personalization === "string" &&
    typeof draft.suggestedPrice === "string" &&
    typeof draft.etsyCategory === "string"
  );
}

export function loadListingDraft(): ListingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LISTING_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isListingDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveListingDraft(draft: ListingDraft): void {
  window.localStorage.setItem(LISTING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}
