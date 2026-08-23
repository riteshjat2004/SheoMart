"use client";

import { useMemo } from "react";
import { MapPin, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import { useStores } from "@/hooks/use-stores";
import { useAddresses } from "@/hooks/use-addresses";
import type { ProductItem, StoreItem } from "@/types/marketplace";

export function ProductStoreSelector({ product, onClose }: { product: ProductItem; onClose: () => void }) {
  const router = useRouter();
  const productsQuery = useProducts();
  const storesQuery = useStores();
  const addressesQuery = useAddresses();
  const address = addressesQuery.data?.find((item) => item.isDefault) ?? addressesQuery.data?.[0];
  const stores = useMemo(() => {
    const candidates = (productsQuery.data ?? []).filter((item) => item.productId && item.storeId && item.name.toLowerCase() === product.name.toLowerCase() && item.categoryId === product.categoryId);
    const storesById = new Map((storesQuery.data ?? []).map((store) => [store.storeId, store]));
    return candidates.map((candidate) => ({ product: candidate, store: storesById.get(candidate.storeId ?? "") })).filter((item): item is { product: ProductItem; store: StoreItem } => Boolean(item.store && item.store.status === "approved")).sort((first, second) => {
      const rating = (second.store.rating ?? 0) - (first.store.rating ?? 0);
      if (rating) return rating;
      const pin = Number(second.store.pincode === address?.pincode) - Number(first.store.pincode === address?.pincode);
      if (pin) return pin;
      const city = Number(second.store.city?.toLowerCase() === address?.city?.toLowerCase()) - Number(first.store.city?.toLowerCase() === address?.city?.toLowerCase());
      if (city) return city;
      return (first.product.discountPrice ?? first.product.price) - (second.product.discountPrice ?? second.product.price);
    }).slice(0, 6);
  }, [address, product.categoryId, product.name, productsQuery.data, storesQuery.data]);

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="available-nearby-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:rounded-3xl">
      <div className="flex items-start justify-between gap-4"><div><h2 id="available-nearby-title" className="text-xl font-semibold text-stone-900 dark:text-stone-50">Available Nearby</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Choose a store before viewing this product.</p></div><button type="button" onClick={onClose} aria-label="Close store selector" className="rounded-full p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"><X className="h-5 w-5" /></button></div>
      <div className="mt-5 space-y-3">{stores.length ? stores.map(({ product: storeProduct, store }) => <div key={`${store.storeId}-${storeProduct.productId}`} className="flex gap-3 rounded-2xl border border-stone-200 p-3 dark:border-stone-700"><div className="flex w-20 shrink-0 flex-col gap-1"><div className="h-12 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">{store.banner ? <img src={store.banner} alt="" className="h-full w-full object-cover" /> : null}</div><div className="-mt-5 ml-2 h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-emerald-100 text-center text-sm font-semibold leading-8 text-emerald-700 dark:border-zinc-900">{store.logo ? <img src={store.logo} alt="" className="h-full w-full object-cover" /> : store.storeName?.charAt(0)}</div></div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-900 dark:text-stone-50">{store.storeName}</p><p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><Star className="h-3 w-3 fill-current text-amber-500" />{store.rating?.toFixed(1) ?? "New"} ({store.totalReviews ?? 0})</p><p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><MapPin className="h-3 w-3" />{[store.address, store.city].filter(Boolean).join(", ") || "Area unavailable"}</p></div><div className="flex shrink-0 flex-col items-end justify-between gap-2"><p className="font-semibold text-stone-900 dark:text-stone-50">₹{storeProduct.discountPrice ?? storeProduct.price}</p>{storeProduct.discountPrice && storeProduct.discountPrice < storeProduct.price ? <p className="text-xs text-stone-400 line-through">₹{storeProduct.price}</p> : null}<button type="button" onClick={() => { onClose(); router.push(`/store/${store.storeId}/product/${storeProduct.productId}`); }} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Visit Store</button></div></div>) : <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-500 dark:bg-stone-950">No nearby stores sell this product.</p>}</div>
    </div>
  </div>;
}