"use client";

import React from "react";
import { FilePen, DollarSign } from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Customer } from "@/types/customer";
import { CustomerPaymentForm } from "@/components/ui/form/CustomerPaymentForm";
import DCBack from "./DCBack";

interface DCHeaderProps {
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (value: boolean) => void;
  customer: Customer | null;
  customerId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DCHeader({
  isPaymentModalOpen,
  setIsPaymentModalOpen,
  customer,
  customerId,
  onSuccess,
  onCancel,
}: DCHeaderProps) {
  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    onSuccess();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 w-full pb-2">
        <DCBack />
        <div className="flex items-center gap-2 sm:gap-3 flex-none">
          <ButtonNav
            href={`/customers/${customer?.id}/edit`}
            variant="secondary"
            className="px-3.5 py-2 text-xs font-semibold  border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-all shadow-sm"
            icon={<FilePen className="w-3.5 h-3.5" />}
          >
            Edit
          </ButtonNav>
          <ButtonNav
            onClick={() => setIsPaymentModalOpen(true)}
            icon={<DollarSign className="w-3.5 h-3.5" />}
            iconPosition="left"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Payment
          </ButtonNav>
        </div>
      </div>
      <BaseModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pay Customer Bill"
        size="md"
      >
        <CustomerPaymentForm
          customerId={Number(customerId)}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setIsPaymentModalOpen(false);
            onCancel();
          }}
        />
      </BaseModal>
    </>
  );
}
