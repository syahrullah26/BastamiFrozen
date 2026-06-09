"use client";

import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { SupplierForm } from "@/components/ui/form/SupplierForm";
import { Plus } from "lucide-react";

interface SupplierHeaderProps {
  onSuccess: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  handleOpenModal: () => void;
}

export default function SupplierHeader({
  onSuccess,
  isModalOpen,
  setIsModalOpen,
  handleOpenModal,
}: SupplierHeaderProps) {
  const handleSuccess = () => {
    setIsModalOpen(false);
    onSuccess();
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-brand-dark">
          Suppliers
        </h1>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">
          Manage and monitor your bills
        </p>
      </div>
      <ButtonNav
        onClick={handleOpenModal}
        icon={<Plus className="w-4 h-4" />}
        iconPosition="left"
        fullWidth={false}
      >
        Add Suppliers
      </ButtonNav>
      <BaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Pay Suppliers"
        size="md"
      >
        <SupplierForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
      </BaseModal>
    </div>
  );
}
