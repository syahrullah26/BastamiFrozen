"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Box,
  FilePen,
  Printer,
  CreditCard,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { formatDate } from "@/utils/helper";
import { Sale } from "@/types/sale";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { CustomerPaymentForm } from "@/components/ui/form/CustomerPaymentForm";

interface HeaderSalesDetailProps {
  sale: Sale | null;
  handlePrint: () => void;
  handlePaymentSuccess: () => void;
  handlePaymentCancel: () => void;
  isModalPaymentOpen: boolean;
  setIsModalPaymentOpen: (isModalPaymentOpen: boolean) => void;
}

export default function HeaderSalesDetail({
  sale,
  handlePrint,
  handlePaymentSuccess,
  handlePaymentCancel,
  isModalPaymentOpen,
  setIsModalPaymentOpen,
}: HeaderSalesDetailProps) {
  const router = useRouter();
  const remainingBill = sale?.amount.remaining_bill || 0;

  return (
    <div className="space-y-4">
      <div className="w-full border-b border-zinc-100 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-none">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 cursor-pointer transition-colors group"
            >
              <div className="p-1.5 rounded-xl group-hover:bg-zinc-100 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest pl-1 hidden xs:inline">
                Back
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full lg:max-w-md">
          <div className="flex items-center justify-start">
            <span className="text-base md:text-lg font-bold tracking-tight text-zinc-900 font-mono">
              #{sale?.invoice_number || "—"}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                sale?.status === "unpaid"
                  ? "text-amber-600 bg-amber-50 border-amber-200/60"
                  : "text-emerald-600 bg-emerald-50 border-emerald-200/60"
              }`}
            >
              {sale?.status || "—"}
            </span>
          </div>
          <div className="flex items-center justify-start">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {sale?.transaction_date ? formatDate(sale.transaction_date) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <Box className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {sale?.items?.length || 0} Products
            </span>
          </div>
        </div>

        <div
          className={`grid ${remainingBill > 0 ? "grid-cols-3" : "grid-cols-2"} gap-2 w-full lg:w-auto min-w-70`}
        >
          <div className="w-full">
            <ButtonNav
              href={`/sales/${sale?.id}/edit`}
              className="w-full justify-center px-3 py-2 text-xs font-semibold rounded-xl"
              icon={<FilePen className="w-3.5 h-3.5" />}
              iconPosition="left"
              variant="neutral"
              fullWidth={false}
            >
              Edit
            </ButtonNav>
          </div>
          <div className="w-full">
            <ButtonNav
              onClick={handlePrint}
              className="w-full justify-center px-3 py-2 text-xs font-semibold rounded-xl"
              icon={<Printer className="w-3.5 h-3.5" />}
              variant="secondary"
              iconPosition="left"
              fullWidth={false}
            >
              Print
            </ButtonNav>
          </div>
          {remainingBill > 0 && (
            <div className="w-full">
              <ButtonNav
                onClick={() => setIsModalPaymentOpen(true)}
                className="w-full justify-center px-3 py-2 text-xs font-semibold rounded-xl"
                icon={<CreditCard className="w-3.5 h-3.5" />}
                iconPosition="left"
                variant="primary"
                fullWidth={false}
              >
                Payment
              </ButtonNav>
              <BaseModal
                title="Customer Payment"
                isOpen={isModalPaymentOpen}
                onClose={handlePaymentCancel}
                size="md"
              >
                <CustomerPaymentForm
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                  customerId={sale?.customer_id}
                  amount={remainingBill}
                />
              </BaseModal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
