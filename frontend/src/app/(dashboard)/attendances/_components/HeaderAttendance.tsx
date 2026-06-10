"use client";

import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { AttendanceForm } from "@/components/ui/form/AttendanceForm";
import { Plus } from "lucide-react";

interface HeaderAttendanceProps {
  handleOpenModal: () => void;
  isModalOpen: boolean;
  handleCloseModal: () => void;
  handleSuccess: () => void;
}

export default function HeaderAttendance({
  handleOpenModal,
  isModalOpen,
  handleCloseModal,
  handleSuccess,
}: HeaderAttendanceProps) {
  return (
    <>
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Attendance
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your employee attendances
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ButtonNav
            onClick={handleOpenModal}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
          >
            Add Attendance
          </ButtonNav>
        </div>
      </div>
      <BaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Customer"
        size="md"
      >
        <AttendanceForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
      </BaseModal>
    </>
  );
}
