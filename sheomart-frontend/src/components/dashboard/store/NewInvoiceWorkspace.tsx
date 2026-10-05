"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Barcode,
  PackageSearch,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerSelector, type CustomerMode } from "@/components/dashboard/store/CustomerSelector";
import { BillingCartItem, type BillingCartItemData } from "@/components/dashboard/store/BillingCartItem";
import { InvoiceReceiptModal, type InvoiceReceiptData } from "@/components/dashboard/store/InvoiceReceiptModal";
import { usePosCatalog } from "@/hooks/use-pos-catalog";
import { useCreateOfflineInvoice } from "@/hooks/use-create-offline-invoice";
import type { PosCatalogProduct, StockStatus } from "@/services/billing";
import type { StoreCustomer } from "@/types/store-customer";

// Debounce hook (300ms) to avoid re-filtering on every keystroke
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useMemo(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

const STOCK_BADGE: Record<
  StockStatus,
  { label: string; cls: string }
> = {
  IN_STOCK: {
    label: "In Stock",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  LOW_STOCK: {
    label: "Low Stock",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

export function NewInvoiceWorkspace() {
  // ── State ───────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<BillingCartItemData[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [customerMode, setCustomerMode] = useState<CustomerMode>("walk-in");
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >();
  const [selectedCustomer, setSelectedCustomer] = useState<StoreCustomer | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<InvoiceReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // ── Data (single unified request — zero N+1) ────────────────────────────
  const { data: catalog, isLoading, isFetching, isError, error, refetch } =
    usePosCatalog();

  const createInvoiceMutation = useCreateOfflineInvoice();

  const debouncedSearch = useDebounced(search, 300);

  // ── Filtered products ───────────────────────────────────────────────────
  const filteredProducts = useMemo<PosCatalogProduct[]>(() => {
    const products = catalog?.products ?? [];
    const q = debouncedSearch.trim().toLowerCase();

    return products.filter((p) => {
      if (activeCategoryId && p.categoryId !== activeCategoryId) return false;
      if (!q) return true;
      const baseMatch = `${p.name} ${p.sku} ${p.brand} ${p.categoryName || ""}`.toLowerCase().includes(q);
      if (baseMatch) return true;
      return (p.variants || []).some(
        (v) =>
          v.label?.toLowerCase().includes(q) ||
          (v.sku && v.sku.toLowerCase().includes(q))
      );
    });
  }, [catalog, debouncedSearch, activeCategoryId]);

  // ── In-cart count helper ────────────────────────────────────────────────
  const getCartCount = useCallback(
    (productId: string, variantId?: string) => {
      const item = cartItems.find(
        (i) => i.productId === productId && (i.variantId || "") === (variantId || "")
      );
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  // ── Cart helpers ────────────────────────────────────────────────────────
  const addToBill = useCallback(
    (product: PosCatalogProduct, variant?: import("@/types/marketplace").ProductVariant) => {
      const availableStock =
        variant && product.stockTrackingMode === "SEPARATE" && typeof variant.stock === "number"
          ? variant.stock
          : product.availableQuantity;

      if (!product.productId || availableStock < 1) return;

      const price = variant
        ? variant.discountPrice && variant.discountPrice > 0
          ? variant.discountPrice
          : variant.price
        : product.discountPrice > 0
        ? product.discountPrice
        : product.price;

      const cartKey = `${product.productId}_${variant?.variantId || ""}`;

      setCartItems((current) => {
        const existing = current.find(
          (i) => `${i.productId}_${i.variantId || ""}` === cartKey
        );
        if (existing) {
          if (existing.quantity >= availableStock) return current;
          return current.map((i) =>
            `${i.productId}_${i.variantId || ""}` === cartKey
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  lineTotal: (i.quantity + 1) * i.price,
                }
              : i
          );
        }
        return [
          ...current,
          {
            productId: product.productId,
            variantId: variant?.variantId,
            variantLabel: variant?.label,
            productName: variant ? `${product.name} (${variant.label})` : product.name,
            sku: variant?.sku || product.sku,
            image: product.thumbnail,
            price,
            availableQuantity: availableStock,
            quantity: 1,
            lineTotal: price,
          },
        ];
      });
    },
    []
  );

  const updateCartQuantity = useCallback(
    (cartKey: string, quantity: number) => {
      setCartItems((current) =>
        current.map((item) => {
          if (`${item.productId}_${item.variantId || ""}` !== cartKey) return item;
          const next = Math.max(1, Math.min(quantity, item.availableQuantity));
          return { ...item, quantity: next, lineTotal: next * item.price };
        })
      );
    },
    []
  );

  const removeFromBill = useCallback((cartKey: string) => {
    setCartItems((current) =>
      current.filter((i) => `${i.productId}_${i.variantId || ""}` !== cartKey)
    );
  }, []);

  // ── Barcode scanning / rapid search Enter ──────────────────────────────
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const rawQuery = search.trim();
      if (!rawQuery) return;
      const q = rawQuery.toLowerCase();

      // 1. Exact match on variant SKU / barcode
      for (const prod of catalog?.products ?? []) {
        const matchingVariant = (prod.variants || []).find(
          (v) => v.sku && v.sku.toLowerCase() === q
        );
        if (matchingVariant) {
          addToBill(prod, matchingVariant);
          setSearch("");
          return;
        }
      }

      // 2. Exact match on product SKU
      const exactSkuProduct = (catalog?.products ?? []).find(
        (p) => p.sku && p.sku.toLowerCase() === q
      );
      if (exactSkuProduct) {
        addToBill(exactSkuProduct);
        setSearch("");
        return;
      }

      // 3. If filtered list has exactly 1 product, add it
      if (filteredProducts.length === 1) {
        const prod = filteredProducts[0];
        const matchingVariant = (prod.variants || []).find(
          (v) =>
            (v.sku && v.sku.toLowerCase() === q) ||
            (v.label && v.label.toLowerCase().includes(q))
        );
        addToBill(prod, matchingVariant);
        setSearch("");
      }
    }
  };

  // ── Totals ──────────────────────────────────────────────────────────────
  const itemCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const subtotal = cartItems.reduce((t, i) => t + i.lineTotal, 0);
  const grandTotal = subtotal;
  const enteredAmount = Number(amountPaid);
  const normalizedAmountPaid = Number.isFinite(enteredAmount)
    ? Math.max(0, enteredAmount)
    : 0;
  const remainingAmount = Math.max(0, grandTotal - normalizedAmountPaid);
  const paymentStatus =
    grandTotal > 0 && normalizedAmountPaid >= grandTotal
      ? "Paid"
      : normalizedAmountPaid > 0
        ? "Partially Paid"
        : "Pending";

  const mobileError =
    mobileNumber.length > 0 && mobileNumber.length !== 10;
  const customerSelectionRequired =
    customerMode !== "walk-in" && !selectedCustomerId;

  // ── Submit ──────────────────────────────────────────────────────────────
  const generateInvoice = async () => {
    setFeedback(null);
    if (cartItems.length === 0) {
      setFeedback({
        type: "error",
        message: "Add at least one product before generating an invoice.",
      });
      return;
    }
    if (customerSelectionRequired) {
      setFeedback({
        type: "error",
        message: "Select a registered customer before generating an invoice.",
      });
      return;
    }
    if (mobileError) {
      setFeedback({
        type: "error",
        message: "Enter a valid 10-digit mobile number.",
      });
      return;
    }

    const payload = {
      ...(customerMode === "walk-in"
        ? {
            walkInCustomerName: customerName.trim() || undefined,
            walkInCustomerPhone: mobileNumber || undefined,
          }
        : selectedCustomerId
          ? {
              customerId: selectedCustomerId,
              walkInCustomerName: customerName.trim() || selectedCustomer?.name || undefined,
              walkInCustomerPhone: mobileNumber || selectedCustomer?.mobile || selectedCustomer?.phone || undefined,
            }
          : {}),
      paymentMethod: paymentMethod as "CASH" | "UPI" | "CREDIT",
      amountPaid: Math.min(normalizedAmountPaid, grandTotal),
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: 0,
      })),
    };

    const currentCartCopy = [...cartItems];
    const currentCustomerName =
      customerName.trim() ||
      (customerMode === "walk-in" ? "Walk-in Customer" : selectedCustomer?.name || "Customer");
    const currentCustomerPhone = mobileNumber;
    const currentGrandTotal = grandTotal;
    const currentSubtotal = subtotal;
    const currentAmountPaid = normalizedAmountPaid;
    const currentRemaining = remainingAmount;
    const currentPaymentStatus = paymentStatus;
    const currentPaymentMethod = paymentMethod;
    const currentIsPlus =
      customerMode === "plus" || selectedCustomer?.isPlusCustomer === true;

    try {
      const invoice = await createInvoiceMutation.mutateAsync(payload);

      const receiptData: InvoiceReceiptData = {
        invoiceNumber: invoice.invoiceNumber,
        storeName: catalog?.store?.storeName || "SheoMart Store POS",
        createdAt: new Date().toISOString(),
        customerName: currentCustomerName,
        customerPhone: currentCustomerPhone,
        customerEmail: selectedCustomer?.email,
        customerType: customerMode,
        isPlusCustomer: currentIsPlus,
        paymentMethod: currentPaymentMethod,
        paymentStatus: currentPaymentStatus,
        subtotal: currentSubtotal,
        discount: 0,
        grandTotal: currentGrandTotal,
        amountPaid: currentAmountPaid,
        remainingAmount: currentRemaining,
        items: currentCartCopy.map((item) => ({
          name: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          lineTotal: item.lineTotal,
        })),
      };

      setGeneratedReceipt(receiptData);
      setIsReceiptModalOpen(true);

      // Invalidate queries so history, KPI cards, and register balances update immediately
      void queryClient.invalidateQueries({ queryKey: ["billing-invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["daily-cash-summary"] });
      await refetch();

      setFeedback({
        type: "success",
        message: `Invoice #${invoice.invoiceNumber} created successfully.`,
      });

      setCartItems([]);
      setAmountPaid("");
      setPaymentMethod("CASH");
      setCustomerMode("walk-in");
      setCustomerName("");
      setMobileNumber("");
      setSelectedCustomerId(undefined);
      setSelectedCustomer(null);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Unable to create invoice.",
      });
    }
  };

  // ── Categories pill list ─────────────────────────────────────────────────
  const categories = catalog?.categories ?? [];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1.4fr)_380px]">
      {/* ── Left: Product Catalog ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <CustomerSelector
          mode={customerMode}
          customerName={customerName}
          mobileNumber={mobileNumber}
          selectedCustomerId={selectedCustomerId}
          onModeChange={setCustomerMode}
          onCustomerNameChange={setCustomerName}
          onMobileNumberChange={setMobileNumber}
          onCustomerSelect={(c) => {
            setSelectedCustomer(c);
            setSelectedCustomerId(c?.customerId);
          }}
        />

        {customerSelectionRequired ? (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Select a registered customer before generating an invoice.
          </p>
        ) : null}

        {feedback ? (
          <div
            className={`rounded-lg border p-4 text-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <section className="rounded-xl border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">
                Products
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Search your catalog to add products to the invoice.
              </p>
            </div>
            <PackageSearch className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* Search & actions */}
          <div className="mt-5 flex gap-2">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
              <input
                id="pos-search-input"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by product, pack, SKU, or scan barcode..."
                className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const el = document.getElementById("pos-search-input") as HTMLInputElement | null;
                el?.focus();
                el?.select();
              }}
              aria-label="Scan barcode"
              title="Focus search for barcode scanning"
            >
              <Barcode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh products"
              title="Refresh inventory"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategoryId(null)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeCategoryId === null
                    ? "bg-emerald-600 text-white"
                    : "border border-stone-200 text-stone-600 hover:border-emerald-400 dark:border-stone-700 dark:text-stone-300"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  type="button"
                  onClick={() =>
                    setActiveCategoryId(
                      activeCategoryId === cat.categoryId
                        ? null
                        : cat.categoryId
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    activeCategoryId === cat.categoryId
                      ? "bg-emerald-600 text-white"
                      : "border border-stone-200 text-stone-600 hover:border-emerald-400 dark:border-stone-700 dark:text-stone-300"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Product grid */}
          <div className="mt-5">
            {isLoading ? <LoadingSkeleton rows={4} /> : null}
            {!isLoading && isError ? (
              <EmptyState
                title="Unable to load products"
                description={error?.message ?? "Please try again."}
              />
            ) : null}
            {!isLoading && !isError && filteredProducts.length === 0 ? (
              <EmptyState
                title="No products match your search"
                description={
                  (catalog?.products.length ?? 0) === 0
                    ? "Create products in your seller catalog to start billing."
                    : "Try another product name, SKU, or brand."
                }
              />
            ) : null}

            {!isLoading && !isError && filteredProducts.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredProducts.map((product) => {
                  const badge = STOCK_BADGE[product.stockStatus];
                  const sellingPrice =
                    product.discountPrice > 0
                      ? product.discountPrice
                      : product.price;
                  const isOutOfStock = product.availableQuantity === 0;
                  return (
                    <div
                      key={product.productId}
                      className="flex gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50"
                    >
                      {/* Thumbnail */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PackageSearch className="h-6 w-6" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-stone-900 dark:text-stone-50">
                              {product.name}
                            </h3>
                            <p className="mt-1 truncate text-xs text-stone-500 dark:text-stone-400">
                              {product.brand || "Unbranded"} · SKU{" "}
                              {product.sku || "-"}
                            </p>
                            <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                              {product.categoryName} · {product.unitLabel || (product.sellingType === "WEIGHT" ? "per kg" : product.sellingType === "VOLUME" ? "per L" : "per piece")}
                            </p>
                          </div>
                          {/* Stock chip */}
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        {/* Variant Quick Buttons if available */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {product.variants.map((v) => {
                              const vPrice =
                                v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price;
                              const vStock =
                                product.stockTrackingMode === "SEPARATE" && typeof v.stock === "number"
                                  ? v.stock
                                  : product.availableQuantity;
                              const isVOutOfStock = vStock <= 0;
                              const vInBill = getCartCount(product.productId, v.variantId);
                              const isVMaxedOut = vInBill >= vStock;

                              return (
                                <button
                                  key={v.variantId}
                                  type="button"
                                  onClick={() => addToBill(product, v)}
                                  disabled={isVOutOfStock || isVMaxedOut}
                                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                                    vInBill > 0
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs dark:border-emerald-500/60 dark:bg-emerald-950/60 dark:text-emerald-200"
                                      : isVOutOfStock
                                      ? "cursor-not-allowed border-dashed border-stone-300 bg-stone-100 text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-600"
                                      : "border-stone-200 bg-white text-stone-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                                  }`}
                                  title={
                                    isVOutOfStock
                                      ? "Out of stock"
                                      : v.sku
                                      ? `SKU: ${v.sku} · Available: ${vStock}`
                                      : `Available: ${vStock}`
                                  }
                                >
                                  <span>{v.label}</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{vPrice}
                                  </span>
                                  {vInBill > 0 && (
                                    <span className="rounded-full bg-emerald-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                                      {vInBill}
                                    </span>
                                  )}
                                  {isVOutOfStock && (
                                    <span className="text-[10px] font-normal text-red-500">(Out)</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {(() => {
                          const baseInBill = getCartCount(product.productId);
                          const isBaseMaxedOut = baseInBill >= product.availableQuantity;

                          return (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm">
                                <span className="font-semibold text-stone-900 dark:text-stone-50">
                                  ₹{sellingPrice}
                                </span>
                                <span className="ml-2 text-stone-500 dark:text-stone-400">
                                  {product.availableQuantity} available
                                </span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addToBill(product)}
                                disabled={isOutOfStock || isBaseMaxedOut}
                                variant={baseInBill > 0 ? "secondary" : "default"}
                                className={
                                  baseInBill > 0
                                    ? "border border-emerald-500 bg-emerald-50 font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-200"
                                    : ""
                                }
                              >
                                {product.variants && product.variants.length > 0
                                  ? `Add Base${baseInBill > 0 ? ` (${baseInBill})` : ""}`
                                  : `Add to Bill${baseInBill > 0 ? ` (${baseInBill})` : ""}`}
                              </Button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* ── Right: Billing Cart ───────────────────────────────────────────── */}
      <section className="rounded-xl border border-stone-200 bg-white/95 p-4 sm:p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/95 lg:sticky lg:top-4 xl:top-6 lg:max-h-[calc(100vh-5.5rem)] flex flex-col overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-200/80 dark:border-stone-800/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">
                Billing Cart
              </h2>
              {cartItems.length > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              Review items before generating an invoice.
            </p>
          </div>
          <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-[220px] lg:max-h-[250px] py-1 pr-1 scrollbar-thin">
          {cartItems.length === 0 ? (
            <div className="py-5 text-center">
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                No products added
              </p>
              <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                Click &ldquo;Add to Bill&rdquo; on any product to build this invoice.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {cartItems.map((item) => {
                const cartKey = `${item.productId}_${item.variantId || ""}`;
                return (
                  <BillingCartItem
                    key={cartKey}
                    item={item}
                    onIncrease={() =>
                      updateCartQuantity(cartKey, item.quantity + 1)
                    }
                    onDecrease={() =>
                      updateCartQuantity(cartKey, item.quantity - 1)
                    }
                    onRemove={() => removeFromBill(cartKey)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed Bottom Section (Totals, Payment, Button) */}
        <div className="shrink-0 border-t border-stone-200/80 dark:border-stone-800/80 pt-3 space-y-3 overflow-y-auto max-h-[calc(100vh-22rem)] scrollbar-thin">
          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-stone-600 dark:text-stone-300 text-xs">
              <span>Items</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-300 text-xs">
              <span>Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-300 text-xs">
              <span>Discount</span>
              <span className="font-medium">₹0</span>
            </div>
            <div className="flex justify-between border-t border-stone-200/80 pt-1.5 font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50">
              <span>Grand Total</span>
              <span className="text-base text-emerald-700 dark:text-emerald-400">₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300">
              <span>Payment Status</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                {paymentStatus}
              </span>
            </div>
          </div>

          {/* Payment method */}
          <fieldset className="space-y-1.5">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Payment Method
            </legend>
            <div className="grid grid-cols-3 gap-1.5">
              {(["CASH", "UPI", "CREDIT"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                    paymentMethod === method
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-600"
                  }`}
                >
                  {method === "CASH" ? "Cash" : method === "UPI" ? "UPI" : "Credit"}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Amount paid */}
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Amount Paid
            <input
              type="number"
              min="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="₹0"
              className="mt-1 h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
            />
          </label>

          {paymentMethod === "CREDIT" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
              Remaining amount will be collected later.
            </div>
          ) : null}

          {/* Remaining */}
          <div className="rounded-lg bg-stone-100 p-2 dark:bg-stone-800/80">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-900 dark:text-stone-50">
              <span>Remaining Amount</span>
              <span>₹{remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            size="default"
            disabled={
              cartItems.length === 0 ||
              customerSelectionRequired ||
              createInvoiceMutation.isPending
            }
            onClick={generateInvoice}
          >
            {createInvoiceMutation.isPending
              ? "Generating Invoice..."
              : "Generate Invoice"}
          </Button>
        </div>
      </section>

      <InvoiceReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        invoice={generatedReceipt}
        onNewSale={() => {
          setIsReceiptModalOpen(false);
          setCartItems([]);
          setAmountPaid("");
          setCustomerMode("walk-in");
          setCustomerName("");
          setMobileNumber("");
          setSelectedCustomerId(undefined);
          setSelectedCustomer(null);
        }}
      />
    </div>
  );
}
