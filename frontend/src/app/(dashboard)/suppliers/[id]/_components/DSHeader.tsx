"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, FilePen } from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { SupplierPaymentForm } from "@/components/ui/form/SupplierPaymentForm";
import { Supplier } from "@/types/supplier";

interface DSHeaderProps {
  supplierId: number;
  supplier: Supplier | null;
  setIsPaymentModalOpen: (value: boolean) => void;
  isPaymentModalOpen: boolean;
  onSuccess: () => void;
}

export default function DSHeader({
  supplierId,
  supplier,
  setIsPaymentModalOpen,
  isPaymentModalOpen,
  onSuccess,
}: DSHeaderProps) {
  const router = useRouter();
  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    onSuccess();
  };
  return (
    <div className="w-full border-b border-zinc-150 pb-5 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-zinc-100 transition-all duration-200">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest pl-0.5">
            Back to List
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
              Supplier ID: #{supplierId}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl mt-1">
            Detail Supplier:{" "}
            <span className="font-medium text-zinc-600">
              {supplier?.name || "Loading..."}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ButtonNav
            href={`/suppliers/${supplier?.id}/edit`}
            variant="secondary"
            className="px-4 py-2.5 text-xs font-semibold text-zinc-700  border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-all shadow-xs flex items-center gap-2"
            icon={<FilePen className="w-3.5 h-3.5" />}
          >
            Edit
          </ButtonNav>
          {supplier && (
            <ButtonNav
              onClick={() => setIsPaymentModalOpen(true)}
              icon={<DollarSign className="w-3.5 h-3.5" />}
              iconPosition="left"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:bg-brand-dark/80 disabled:text-zinc-200 disabled:cursor-not-allowed"
              disabled={Number(supplier.remaining_bill || 0) <= 0}
            >
              Payment
            </ButtonNav>
          )}
        </div>
      </div>
      <BaseModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pay Supplier Bill"
        size="md"
      >
        <SupplierPaymentForm
          supplierId={Number(supplierId)}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setIsPaymentModalOpen(false)}
          amount={Number(supplier?.remaining_bill || 0)}
        />
      </BaseModal>
    </div>
  );
}
