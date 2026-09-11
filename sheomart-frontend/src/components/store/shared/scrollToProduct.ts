import type { StoreBadge } from "@/types/marketplace";

export function getProductDomId(productId: string) {
  return `product-${encodeURIComponent(productId)}`;
}

export function scrollToProduct(productId: string, badge: StoreBadge) {
  const node = document.getElementById(getProductDomId(productId));
  if (!node) return;

  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node.classList.add("search-highlight");
  const highlightClass = badge === "royal" ? "search-highlight-royal" : "search-highlight-verified";
  node.classList.add(highlightClass);
  node.animate(
    [{ boxShadow: badge === "royal" ? "0 0 0 3px rgba(212,175,55,0.85), 0 0 34px rgba(212,175,55,0.55)" : "0 0 0 3px rgba(16,185,129,0.8), 0 0 34px rgba(16,185,129,0.45)" }, { boxShadow: "0 0 0 0 transparent, 0 0 0 transparent" }],
    { duration: 2000, easing: "ease-out" }
  );
  window.setTimeout(() => {
    node.classList.remove("search-highlight", highlightClass);
  }, 2000);
}
