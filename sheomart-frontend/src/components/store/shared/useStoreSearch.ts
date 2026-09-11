"use client";

import { useMemo, useState } from "react";
import type { ProductItem } from "@/types/marketplace";

function matchesProduct(product: ProductItem, query: string) {
  const tags = (product as ProductItem & { tags?: string[] }).tags;
  const searchable = [product.name, product.brand, product.category, ...(Array.isArray(tags) ? tags : [])];
  return searchable.filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
}

export function useStoreSearch(products: ProductItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchSurface, setActiveSearchSurface] = useState<"hero" | "sticky">("hero");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(
    () => normalizedQuery ? products.filter((product) => matchesProduct(product, normalizedQuery)) : products,
    [normalizedQuery, products]
  );
  const searchResults = useMemo(() => filteredProducts.slice(0, 6), [filteredProducts]);

  return {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    searchResults,
    clearSearch: () => setSearchQuery(""),
    activeSearchSurface,
    setActiveSearchSurface,
  };
}
