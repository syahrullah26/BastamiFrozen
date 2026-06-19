"use client";
import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { Plus, DollarSign } from "lucide-react";

interface HeaderPaymentProps {
  setShowCustomerModal: (show: boolean) => void;
  setShowSupplierModal: (show: boolean) => void;
}

export default function HeaderPayment({
  setShowCustomerModal,
  setShowSupplierModal,
}: HeaderPaymentProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Payments Financial Ledger
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            Monitor cash flow pipelines, review incoming client invoices, and
            handle supplier expenses.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* <ButtonNav
            onClick={() => setShowCustomerModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Customer Income
          </ButtonNav>
          <ButtonNav
            onClick={() => setShowSupplierModal(true)}
            icon={<DollarSign className="w-4 h-4" />}
            variant="secondary"
          >
            New Supplier Payment
          </ButtonNav> */}
        </div>
      </div>
    </>
  );
}
