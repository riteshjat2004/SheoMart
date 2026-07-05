const STORAGE_KEY = "sheomart-recently-viewed";
const MAX_ITEMS = 12;

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

export function addRecentlyViewedProduct(productId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = getRecentlyViewedIds();
  const filtered = current.filter((id) => id !== productId);
  filtered.unshift(productId);

  if (filtered.length > MAX_ITEMS) {
    filtered.splice(MAX_ITEMS);
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearRecentlyViewed() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
