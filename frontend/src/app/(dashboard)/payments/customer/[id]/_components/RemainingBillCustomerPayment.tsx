"use client";

import React from "react";
import { CustomerPayment } from "@/types/payment";
import { formatRupiah } from "@/utils/helper";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { CustomerPaymentForm } from "@/components/ui/form/CustomerPaymentForm";

interface RemainingBillCustomerPaymentProps {
  payment: CustomerPayment | null;
  paymentPercentage: number;
  totalOrderEstimate: number;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RemainingBillCustomerPayment({
  payment,
  paymentPercentage,
  totalOrderEstimate,
  isModalOpen,
  setIsModalOpen,
  onSuccess,
  onCancel,
}: RemainingBillCustomerPaymentProps) {
  if (!payment) return null;
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
          Financial Status
        </span>
        <h3 className="text-xs font-semibold text-zinc-400">Remaining Bills</h3>
      </div>

      <div className="text-2xl font-black text-red-500">
        {formatRupiah(payment.customer?.remaining_bill || 0)}
      </div>

      <div className="space-y-1">
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full text-primary-brand rounded-full transition-all duration-500"
            style={{ width: `${paymentPercentage}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-400 font-semibold italic">
          {paymentPercentage}% of total order estimates (
          {formatRupiah(totalOrderEstimate)}) has been cleared.
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-primary-brand bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all ${payment.customer.remaining_bill === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        disabled={payment.customer.remaining_bill === 0}
      >
        <CreditCard className="w-4 h-4" /> Record Remaining Payment
      </button>
      <BaseModal
        title="Remaining Payment"
        isOpen={isModalOpen}
        onClose={onCancel}
        size="md"
      >
        <CustomerPaymentForm
          onSuccess={onSuccess}
          onCancel={onCancel}
          customerId={payment.customer?.id}
          amount={payment.customer?.remaining_bill}
        />
      </BaseModal>
    </div>
  );
}
