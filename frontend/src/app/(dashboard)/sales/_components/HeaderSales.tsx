"use client";

import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { SaleForm } from "@/components/ui/form/SaleForm";
import { CustomerPaymentForm } from "@/components/ui/form/CustomerPaymentForm";
import { DollarSignIcon, Plus } from "lucide-react";

interface HeaderSalesProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (isPaymentModalOpen: boolean) => void;
  handleOpenModal: () => void;
  handleOpenPaymentModal: () => void;
  onSuccess: () => void;
}

export default function HeaderSales({
  isModalOpen,
  setIsModalOpen,
  isPaymentModalOpen,
  setIsPaymentModalOpen,
  handleOpenModal,
  handleOpenPaymentModal,
  onSuccess,
}: HeaderSalesProps) {
  const handleSuccess = () => {
    setIsModalOpen(false);
    setIsPaymentModalOpen(false);
    onSuccess();
  };
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Sales
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your customer bills and sales
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ButtonNav
            onClick={handleOpenModal}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
          >
            Add Sales
          </ButtonNav>
          {/* <ButtonNav
            onClick={handleOpenPaymentModal}
            icon={<DollarSignIcon className="w-4 h-4" />}
            iconPosition="left"
            variant="secondary"
            fullWidth={false}
          >
            Payment
          </ButtonNav> */}
        </div>
        <BaseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Add Sales"
          size="lg"
        >
          <SaleForm onSucces={handleSuccess} onCancel={handleCloseModal} />
        </BaseModal>
        {/* <BaseModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          title="Add Customer Payment"
          size="md"
        >
          <CustomerPaymentForm
            onSuccess={handleSuccess}
            onCancel={handleClosePaymentModal}
          />
        </BaseModal> */}
      </div>
    </>
  );
}
