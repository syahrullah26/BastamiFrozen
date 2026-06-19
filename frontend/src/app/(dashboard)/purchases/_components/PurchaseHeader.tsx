"use client";
import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { PurchaseForm } from "@/components/ui/form/PurchaseForm";
import { SupplierPaymentForm } from "@/components/ui/form/SupplierPaymentForm";
import { Plus, DollarSignIcon } from "lucide-react";

interface PurchaseHeaderProps {
  onSuccess: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  handleOpenModal: () => void;
  handleOpenPaymentModal: () => void;
  setIsModalPaymentModal: (value: boolean) => void;
  isModalPaymentOpen: boolean;
}

export default function PurchaseHeader({
  onSuccess,
  isModalOpen,
  setIsModalOpen,
  handleOpenModal,
  handleOpenPaymentModal,
  isModalPaymentOpen,
  setIsModalPaymentModal,
}: PurchaseHeaderProps) {
  const handleSuccess = () => {
    setIsModalOpen(false);
    onSuccess();
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handlePaymentSuccess = () => {
    setIsModalPaymentModal(false);
    onSuccess();
  };
  const handleClosePaymentModal = () => {
    setIsModalPaymentModal(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Purchases
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your bills to suppliers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonNav
            onClick={handleOpenModal}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
          >
            Add Purchases
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
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Purchases"
        size="lg"
      >
        <PurchaseForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
      </BaseModal>
      {/* <BaseModal
        isOpen={isModalPaymentOpen}
        onClose={handleClosePaymentModal}
        title="Pay Suppliers"
        size="md"
      >
        <SupplierPaymentForm
          onSuccess={handlePaymentSuccess}
          onCancel={handleClosePaymentModal}
        />
      </BaseModal> */}
    </>
  );
}
