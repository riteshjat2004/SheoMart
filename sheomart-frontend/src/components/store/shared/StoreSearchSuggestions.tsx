"use client";

import type { ProductItem } from "@/types/marketplace";
import type { StoreTheme } from "@/themes/verifiedTheme";

export function StoreSearchSuggestions({ products, onSelect, theme }: { products: ProductItem[]; onSelect: (product: ProductItem) => void; theme: StoreTheme }) {
  if (!products.length) return null;
  return <div id="store-product-suggestions" className={`absolute left-0 right-0 top-full z-[130] mt-2 overflow-hidden rounded-2xl border p-2 shadow-2xl ${theme.panel}`} role="listbox" aria-label="Store product suggestions">
    {products.map((product) => {
      const candidate = product.image?.url || product.images?.[0] || product.thumbnail;
      const isPlaceholderHost = candidate ? /lorem.*flick/i.test(candidate) : false;
      const image = candidate && !isPlaceholderHost ? candidate : "/placeholder-product.png";
      return <button key={product.productId ?? product.name} type="button" role="option" onClick={() => onSelect(product)} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left ${theme.hover} ${theme.focus}`}>
        <img src={image} alt="" width={44} height={44} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/file.svg"; }} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
        <span className="min-w-0 flex-1"><span className={`block truncate text-sm font-semibold ${theme.panelText}`}>{product.name}</span><span className={`block truncate text-xs ${theme.panelMutedText}`}>{product.category ?? product.brand ?? "Store product"} · {product.quantity && product.quantity > 0 ? "Available" : "Unavailable"}</span></span>
        <span className={`text-sm font-semibold ${theme.accent}`}>₹{product.discountPrice ?? product.price}</span>
      </button>;
    })}
  </div>;
}
