"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useAddresses, useAddAddress, useRemoveAddress } from "@/hooks/use-addresses";
import type { CreateAddressPayload } from "@/services/addresses";

const emptyForm = {
  fullName: "",
  mobile: "",
  house: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  addressType: "Home",
  isDefault: true,
};

export default function AddressesPage() {
  const addressesQuery = useAddresses();
  const addAddressMutation = useAddAddress();
  const removeAddressMutation = useRemoveAddress();
  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);

  const addresses = useMemo(() => (Array.isArray(addressesQuery.data) ? addressesQuery.data : []), [addressesQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    addAddressMutation.mutate(form, {
      onSuccess: () => {
        setFeedback("Address saved successfully.");
        setForm(emptyForm);
      },
      onError: (error) => setFeedback(error instanceof Error ? error.message : "Unable to save address."),
    });
  };

  const handleDelete = (addressId?: string) => {
    if (!addressId) {
      return;
    }

    setFeedback(null);
    removeAddressMutation.mutate(addressId, {
      onSuccess: () => setFeedback("Address removed."),
      onError: (error) => setFeedback(error instanceof Error ? error.message : "Unable to remove address."),
    });
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <SectionHeading eyebrow="Addresses" title="Saved delivery locations" description="Store your home and work addresses for quicker checkout." />

          {feedback ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-950/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              {feedback}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  <span>Full name</span>
                  <input required value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" />
                </label>
                <label className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  <span>Mobile</span>
                  <input required value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" />
                </label>
              </div>
              <label className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                <span>House / Flat / Building</span>
                <input required value={form.house} onChange={(event) => setForm((current) => ({ ...current, house: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" />
              </label>
              <label className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                <span>Street / Area</span>
                <input required value={form.street} onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  <span>Landmark</span>
                  <input value={form.landmark} onChange={(event) => setForm((current) => ({ ...current, landmark: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" />
                </label>
                <label className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  <span>City</span>
                  <input required value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  <span>State</span>
                  <input required value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" />
                </label>
                <label className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  <span>Pincode</span>
                  <input required value={form.pincode} onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" />
                </label>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
                <input type="checkbox" checked={form.isDefault ?? false} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                <span>Set as default address</span>
              </div>
              <Button type="submit" disabled={addAddressMutation.isPending}>
                {addAddressMutation.isPending ? "Saving..." : "Save address"}
              </Button>
            </form>

            <div className="space-y-4">
              {addressesQuery.isLoading ? (
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <p className="text-sm text-stone-500">Loading addresses …</p>
                </div>
              ) : addressesQuery.isError ? (
                <ErrorState message={addressesQuery.error instanceof Error ? addressesQuery.error.message : "Unable to load addresses."} />
              ) : addresses.length ? (
                addresses.map((address) => (
                  <div key={address.addressId} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{address.fullName}</h3>
                          {address.isDefault ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Default</span> : null}
                        </div>
                        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{address.house}, {address.street}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-300">{address.landmark ? `${address.landmark}, ` : ""}{address.city}, {address.state} - {address.pincode}</p>
                        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{address.mobile}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(address.addressId)} disabled={removeAddressMutation.isPending}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No addresses saved yet" description="Add a delivery location to make checkout quicker." />
              )}
            </div>
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
