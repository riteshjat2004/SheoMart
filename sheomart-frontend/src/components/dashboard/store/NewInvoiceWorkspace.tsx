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
import { CustomerSelector, type CustomerMode } from "@/components/dashboard/store/CustomerSelector";
import { BillingCartItem, type BillingCartItemData } from "@/components/dashboard/store/BillingCartItem";
import { usePosCatalog } from "@/hooks/use-pos-catalog";
import { useCreateOfflineInvoice } from "@/hooks/use-create-offline-invoice";
import type { PosCatalogProduct, StockStatus } from "@/services/billing";

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
      return `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(q);
    });
  }, [catalog, debouncedSearch, activeCategoryId]);

  // ── Cart helpers ────────────────────────────────────────────────────────
  const addToBill = useCallback(
    (product: PosCatalogProduct) => {
      if (!product.productId || product.availableQuantity < 1) return;

      const price =
        product.discountPrice > 0 ? product.discountPrice : product.price;

      setCartItems((current) => {
        const existing = current.find((i) => i.productId === product.productId);
        if (existing) {
          if (existing.quantity >= product.availableQuantity) return current;
          return current.map((i) =>
            i.productId === product.productId
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
            productName: product.name,
            sku: product.sku,
            image: product.thumbnail,
            price,
            availableQuantity: product.availableQuantity,
            quantity: 1,
            lineTotal: price,
          },
        ];
      });
    },
    []
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCartItems((current) =>
        current.map((item) => {
          if (item.productId !== productId) return item;
          const next = Math.max(1, Math.min(quantity, item.availableQuantity));
          return { ...item, quantity: next, lineTotal: next * item.price };
        })
      );
    },
    []
  );

  const removeFromBill = useCallback((productId: string) => {
    setCartItems((current) => current.filter((i) => i.productId !== productId));
  }, []);

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
          ? { customerId: selectedCustomerId }
          : {}),
      paymentMethod: paymentMethod as "CASH" | "UPI" | "CREDIT",
      amountPaid: Math.min(normalizedAmountPaid, grandTotal),
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: 0,
      })),
    };

    try {
      const invoice = await createInvoiceMutation.mutateAsync(payload);
      setFeedback({
        type: "success",
        message: `Invoice ${invoice.invoiceNumber} created successfully.`,
      });
      setCartItems([]);
      setAmountPaid("");
      setPaymentMethod("CASH");
      setCustomerMode("walk-in");
      setCustomerName("");
      setMobileNumber("");
      setSelectedCustomerId(undefined);
      // Refetch unified catalog so stock counts are fresh
      await refetch();
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
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
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
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product, SKU, or brand"
                className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled
              aria-label="Scan barcode"
            >
              <Barcode className="h-4 w-4" />
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
              <div className="grid gap-3 md:grid-cols-2">
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
                              {product.categoryName}
                            </p>
                          </div>
                          {/* Stock chip */}
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </div>

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
                            disabled={isOutOfStock}
                          >
                            Add to Bill
                          </Button>
                        </div>
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
      <section className="rounded-xl border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 xl:sticky xl:top-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">
              Billing Cart
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-stone-600 dark:text-stone-300">
              Review items before generating an invoice.
            </p>
          </div>
          <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="No products added."
              description="Search the catalog to start building this invoice."
            />
          </div>
        ) : (
          <div className="mt-5">
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {cartItems.map((item) => (
                <BillingCartItem
                  key={item.productId}
                  item={item}
                  onIncrease={() =>
                    updateCartQuantity(item.productId, item.quantity + 1)
                  }
                  onDecrease={() =>
                    updateCartQuantity(item.productId, item.quantity - 1)
                  }
                  onRemove={() => removeFromBill(item.productId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="mt-5 space-y-3 border-t border-stone-200 pt-5 text-sm dark:border-stone-800">
          <div className="flex justify-between text-stone-600 dark:text-stone-300">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-stone-300">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-stone-300">
            <span>Discount</span>
            <span>₹0</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-stone-300">
            <span>Payment Status</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {paymentStatus}
            </span>
          </div>
        </div>

        {/* Payment method */}
        <fieldset className="mt-5 space-y-3">
          <legend className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Payment Method
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(["CASH", "UPI", "CREDIT"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
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
        <label className="mt-5 block text-sm font-medium text-stone-700 dark:text-stone-200">
          Amount Paid
          <input
            type="number"
            min="0"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="₹0"
            className="mt-2 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
          />
        </label>

        {paymentMethod === "CREDIT" ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
            Remaining amount will be collected later.
          </div>
        ) : null}

        {/* Remaining */}
        <div className="mt-5 rounded-lg bg-stone-100 p-4 dark:bg-stone-800">
          <div className="flex items-center justify-between text-sm font-semibold text-stone-900 dark:text-stone-50">
            <span>Remaining Amount</span>
            <span>₹{remainingAmount.toFixed(2)}</span>
          </div>
        </div>

        <Button
          type="button"
          className="mt-5 w-full"
          size="lg"
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
      </section>
    </div>
  );
}
