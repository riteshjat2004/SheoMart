"use client";

import { useMemo, useState } from "react";
import {
  Home,
  Briefcase,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Search,
  Check,
  Map as MapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import {
  useAddresses,
  useAddAddress,
  useRemoveAddress,
  useUpdateAddress,
} from "@/hooks/use-addresses";
import type { AddressItem, CreateAddressPayload } from "@/services/addresses";

const emptyForm: CreateAddressPayload = {
  fullName: "",
  mobile: "",
  house: "",
  street: "",
  landmark: "",
  city: "Sheopur",
  state: "Madhya Pradesh",
  pincode: "476337",
  addressType: "home",
  isDefault: true,
};

const SERVICEABLE_PINCODES = ["476337", "476339", "476338", "476336"];

export default function AddressesPage() {
  const addressesQuery = useAddresses();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const removeAddressMutation = useRemoveAddress();

  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Delivery check state
  const [checkPincode, setCheckPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"available" | "unavailable" | null>(null);

  const addresses = useMemo(
    () => (Array.isArray(addressesQuery.data) ? addressesQuery.data : []),
    [addressesQuery.data]
  );

  const handleOpenEdit = (addr: AddressItem) => {
    if (!addr.addressId) return;
    setEditingAddressId(addr.addressId);
    setForm({
      fullName: addr.fullName || "",
      mobile: addr.mobile || "",
      house: addr.house || "",
      street: addr.street || "",
      landmark: addr.landmark || "",
      city: addr.city || "Sheopur",
      state: addr.state || "Madhya Pradesh",
      pincode: addr.pincode || "476337",
      addressType: addr.addressType || "home",
      isDefault: addr.isDefault ?? false,
    });
    setIsFormOpen(true);
    setFeedback(null);
  };

  const handleCancelForm = () => {
    setEditingAddressId(null);
    setForm(emptyForm);
    setIsFormOpen(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (editingAddressId) {
      updateAddressMutation.mutate(
        { addressId: editingAddressId, payload: form },
        {
          onSuccess: () => {
            setFeedback("Address updated successfully.");
            handleCancelForm();
          },
          onError: (error) =>
            setFeedback(error instanceof Error ? error.message : "Unable to update address."),
        }
      );
    } else {
      addAddressMutation.mutate(form, {
        onSuccess: () => {
          setFeedback("New delivery address saved.");
          handleCancelForm();
        },
        onError: (error) =>
          setFeedback(error instanceof Error ? error.message : "Unable to save address."),
      });
    }
  };

  const handleDelete = (addressId?: string) => {
    if (!addressId) return;
    if (!window.confirm("Are you sure you want to remove this delivery address?")) return;

    setFeedback(null);
    removeAddressMutation.mutate(addressId, {
      onSuccess: () => setFeedback("Address removed."),
      onError: (error) =>
        setFeedback(error instanceof Error ? error.message : "Unable to remove address."),
    });
  };

  const handleSetDefault = (addressId?: string) => {
    if (!addressId) return;
    updateAddressMutation.mutate(
      { addressId, payload: { isDefault: true } },
      {
        onSuccess: () => setFeedback("Default address updated."),
      }
    );
  };

  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = checkPincode.trim();
    if (!pin) return;
    if (SERVICEABLE_PINCODES.includes(pin)) {
      setPincodeStatus("available");
    } else {
      setPincodeStatus("unavailable");
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "work":
        return <Briefcase className="h-4 w-4" />;
      case "home":
        return <Home className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Delivery Locations
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                Manage Saved Addresses
              </h1>
            </div>
            {!isFormOpen && (
              <Button
                type="button"
                onClick={() => {
                  setEditingAddressId(null);
                  setForm(emptyForm);
                  setIsFormOpen(true);
                }}
                className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add New Address
              </Button>
            )}
          </div>

          {feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300">
              {feedback}
            </div>
          )}

          {/* Delivery Availability Checker Widget */}
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                  Check Delivery Availability in Sheopur
                </h3>
                <p className="mt-0.5 text-xs text-stone-500">
                  Enter your 6-digit delivery pincode to see if doorstep delivery is active.
                </p>
              </div>

              <form onSubmit={handleCheckDelivery} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={checkPincode}
                  onChange={(e) => {
                    setCheckPincode(e.target.value);
                    setPincodeStatus(null);
                  }}
                  placeholder="e.g. 476337"
                  className="w-36 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                />
                <Button type="submit" size="sm" className="bg-emerald-600 text-white">
                  Check
                </Button>
              </form>
            </div>

            {pincodeStatus === "available" && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Great news! Doorstep delivery within 30-45 minutes is available in this area.</span>
              </div>
            )}

            {pincodeStatus === "unavailable" && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <MapPin className="h-4 w-4 text-amber-600" />
                <span>
                  Currently outside standard delivery zone. You can still order for in-store pickup!
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Address Cards List */}
            <div className="space-y-4">
              {addressesQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-stone-100" />
                  ))}
                </div>
              ) : addressesQuery.isError ? (
                <ErrorState
                  message={
                    addressesQuery.error instanceof Error
                      ? addressesQuery.error.message
                      : "Unable to load addresses."
                  }
                />
              ) : addresses.length ? (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.addressId}
                      className={`relative rounded-[1.75rem] border p-5 shadow-sm transition ${
                        addr.isDefault
                          ? "border-emerald-500 bg-emerald-50/20 dark:border-emerald-800 dark:bg-emerald-950/20"
                          : "border-stone-200 bg-white dark:border-stone-800 dark:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                              {getTypeIcon(addr.addressType)}
                              {addr.addressType || "Home"}
                            </span>
                            {addr.isDefault && (
                              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                Default Delivery Address
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-base font-bold text-stone-900 dark:text-stone-50">
                              {addr.fullName} •{" "}
                              <span className="text-sm font-normal text-stone-500">
                                {addr.mobile}
                              </span>
                            </p>
                            <p className="mt-1 text-xs leading-5 text-stone-600 dark:text-stone-300">
                              {addr.house}, {addr.street}
                              {addr.landmark ? `, Near ${addr.landmark}` : ""}
                            </p>
                            <p className="text-xs text-stone-500">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(addr.addressId)}
                              className="text-xs font-semibold text-emerald-600 hover:underline"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(addr)}
                            title="Edit"
                            className="rounded-full p-2 text-stone-400 hover:text-emerald-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(addr.addressId)}
                            title="Delete"
                            className="rounded-full p-2 text-stone-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No saved addresses yet"
                  description="Add your home or work address for lightning fast delivery and checkout."
                />
              )}
            </div>

            {/* Address Form & Map location placeholder */}
            <div className="space-y-4">
              {isFormOpen ? (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                      {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Address Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Address Label
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["home", "work", "other"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, addressType: t }))}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold uppercase capitalize transition ${
                            form.addressType === t
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300"
                          }`}
                        >
                          {getTypeIcon(t)}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Full Name
                      </label>
                      <input
                        required
                        value={form.fullName}
                        onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Phone Number
                      </label>
                      <input
                        required
                        value={form.mobile}
                        onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      House / Flat / Floor / Building
                    </label>
                    <input
                      required
                      value={form.house}
                      onChange={(e) => setForm((prev) => ({ ...prev, house: e.target.value }))}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Street / Colony / Area
                    </label>
                    <input
                      required
                      value={form.street}
                      onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Landmark
                      </label>
                      <input
                        value={form.landmark}
                        onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Pincode
                      </label>
                      <input
                        required
                        value={form.pincode}
                        onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Make this my default delivery address</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelForm}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {editingAddressId ? "Update Address" : "Save Address"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                    <MapIcon className="h-4 w-4" />
                    <span>Map Location Preview</span>
                  </div>

                  <div className="mt-3 aspect-video overflow-hidden rounded-2xl border border-stone-100 bg-emerald-950/10 flex flex-col items-center justify-center text-center p-4 dark:border-stone-800 dark:bg-stone-950">
                    <MapPin className="h-8 w-8 text-emerald-600 animate-bounce" />
                    <p className="mt-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      Sheopur, Madhya Pradesh
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Precise GPS pin attached automatically at checkout
                    </p>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-stone-500">
                    Your delivery partner uses this address information and live phone contact for
                    seamless doorstep handover.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
