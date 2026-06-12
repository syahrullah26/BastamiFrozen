"use client";
import React from "react";
import { Purchase } from "@/types/purchase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BoxIcon,
  Calendar,
  CreditCard,
  FilePen,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { formatDate } from "@/utils/helper";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { SupplierPaymentForm } from "@/components/ui/form/SupplierPaymentForm";

interface HeaderPurchaseDetailProps {
  purchase: Purchase | null;
  isModalPaymentOpen: boolean;
  setIsModalPaymentOpen: (isModalPaymentOpen: boolean) => void;
  handlePaymentSuccess: () => void;
  handlePaymentCancel: () => void;
}

export default function HeaderPurchaeDetail({
  purchase,
  isModalPaymentOpen,
  setIsModalPaymentOpen,
  handlePaymentSuccess,
  handlePaymentCancel,
}: HeaderPurchaseDetailProps) {
  const router = useRouter();
  const remainingBill = purchase?.remaining_bill || 0;
  return (
    <>
      <div className="w-full border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-none">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors group"
            >
              <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] pl-1 hidden xs:inline">
                Back
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full lg:max-w-md">
          <div className="flex items-center justify-start">
            <span className="text-lg font-black tracking-tight text-zinc-800 font-mono">
              #{purchase?.invoice_number || "—"}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                purchase?.status === "unpaid"
                  ? "text-amber-600 bg-amber-50 border-amber-200/60"
                  : "text-emerald-600 bg-emerald-50 border-emerald-200/60"
              }`}
            >
              {purchase?.status || "—"}
            </span>
          </div>
          <div className="flex items-center justify-start">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {purchase?.transaction_date
                ? formatDate(purchase?.transaction_date)
                : "—"}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <BoxIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {purchase?.items?.length || 0} Products
            </span>
          </div>
        </div>
        <div
          className={`grid ${remainingBill > 0 ? "grid-cols-2" : "grid-cols-1"} gap-2 w-full lg:w-auto min-w-70`}
        >
          <div className="w-full">
            <ButtonNav
              href={`/purchases/${purchase?.id}/edit`}
              className="justify-center px-3 py-2 text-xs font-semibold rounded-xl"
              icon={<FilePen className="w-3.5 h-3.5" />}
              iconPosition="left"
              variant="neutral"
              fullWidth={false}
            >
              Edit
            </ButtonNav>
          </div>
          {remainingBill > 0 && (
            <div className="w-full">
              <ButtonNav
                onClick={() => {
                  setIsModalPaymentOpen(true);
                }}
                className="justify-center px-3 py-2 text-xs font-semibold rounded-xl"
                icon={<CreditCard className="w-3.5 h-3.5" />}
                iconPosition="left"
                fullWidth={false}
              >
                Add Payment
              </ButtonNav>
              <BaseModal
                title="Supplier Payment"
                isOpen={isModalPaymentOpen}
                onClose={handlePaymentCancel}
                size="md"
              >
                <SupplierPaymentForm
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                  amount={remainingBill}
                  supplierId={purchase?.supplier_id}
                />
              </BaseModal>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
