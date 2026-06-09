"use client";

import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { AttendanceForm } from "@/components/ui/form/AttendanceForm";
import { EmployeeForm } from "@/components/ui/form/EmployeeForm";
import { Plus, Calendar } from "lucide-react";

interface HeaderEmployeeProps {
  handleOpenModal: () => void;
  handleOpenAttendanceModal: () => void;
  isModalOpen: boolean;
  handleCloseModal: () => void;
  handleSuccess: () => void;
  isAttendanceModalOpen: boolean;
  handleCloseAttendanceModal: () => void;
}

export default function HeaderEmployee({
  handleOpenModal,
  handleOpenAttendanceModal,
  isModalOpen,
  handleCloseModal,
  handleSuccess,
  isAttendanceModalOpen,
  handleCloseAttendanceModal,
}: HeaderEmployeeProps) {
  return (
    <>
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Employees
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your employee
          </p>
        </div>
        <div className="flex flex-col gap-2 ">
          <ButtonNav
            onClick={handleOpenModal}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
          >
            Add Employee
          </ButtonNav>
          <ButtonNav
            onClick={handleOpenAttendanceModal}
            icon={<Calendar className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
            variant="secondary"
          >
            Attendance
          </ButtonNav>
        </div>

        <BaseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Add Customer"
          size="md"
        >
          <EmployeeForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
        </BaseModal>
        <BaseModal
          isOpen={isAttendanceModalOpen}
          onClose={handleCloseAttendanceModal}
          title="Add Attendance"
          size="lg"
        >
          <AttendanceForm
            onSuccess={handleSuccess}
            onCancel={handleCloseModal}
          />
        </BaseModal>
      </div>
    </>
  );
}
