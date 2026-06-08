"use client";

import React, { useState } from "react";
import { SaleService } from "@/services/saleService";
import axios from "axios";

import { toast } from "sonner";

interface BackfillButtonProps {
  productId?: string | number | null;
  onSuccess?: () => void;
}

export default function SyncHppButton({
  productId = null,
  onSuccess,
}: BackfillButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Synchronizing pending HPP...");

    try {
      const response = await SaleService.triggerBackfill({
        product_id: productId,
      });

      if (response.status) {
        toast.success(response.message || "HPP Synchronized Successfully!", {
          id: toastId,
        });

        if (onSuccess) onSuccess();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to synchronize HPP. Please try again.";
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          id: toastId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
        isLoading
          ? "bg-brand-neutral cursor-not-allowed"
          : "bg-primary-brand hover:bg-brand-dark active:bg-brand-dark/70"
      }`}
    >
      {isLoading ? (
        <>
          <svg
            className="w-4 h-4 text-white animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Synchronizing...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"
            />
          </svg>
          Sync Pending HPP
        </>
      )}
    </button>
  );
}
