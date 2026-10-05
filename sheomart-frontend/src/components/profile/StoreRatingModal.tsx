"use client";

import { X } from "lucide-react";
import { StoreRatingCard } from "./StoreRatingCard";
import type { OrderRecord } from "@/services/orders";

interface StoreRatingModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StoreRatingModal({ order, isOpen, onClose }: StoreRatingModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <StoreRatingCard
          order={order}
          className="border-0 shadow-none"
          onRated={() => {
            setTimeout(() => {
              onClose();
            }, 1200);
          }}
        />
      </div>
    </div>
  );
}
