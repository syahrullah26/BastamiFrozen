"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { EmployeeService } from "@/services/employeeService";
import { Employee, EmployeeStats } from "@/types/employee";
import TableData from "@/components/ui/Table/TableData";
import ButtonNav from "@/components/ui/button/ButtonNav";
import {
  Plus,
  Search,
  Filter,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";
import StatsCard from "@/components/ui/card/StatsCard";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { EmployeeColumns } from "@/constants/DataTable/employeeData";
import { EmployeeForm } from "@/components/ui/form/EmployeeForm";
import { formatRupiah } from "@/utils/helper";
import { AttendanceForm } from "@/components/ui/form/AttendanceForm";

export default function EmployeePages() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [employeeStats, setEmployeeStats] = useState<EmployeeStats>({
    total_daily_salary: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const loadData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await EmployeeService.getEmployees(pageNumber);
      setEmployees(data.data.data || []);
      setCurrentPage(data.data.meta?.current_page || 1);
      setLastPage(data.data.meta?.last_page || 1);
      setTotalItems(data.data.meta?.total || 0);

      const metaStats = data.data.meta?.stats;
      if (metaStats) {
        setEmployeeStats({
          total_daily_salary: metaStats.total_daily_salary || 0,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await loadData(currentPage);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [loadData, currentPage]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSuccess = () => loadData();

  const handleOpenAttendanceModal = () => setIsAttendanceModalOpen(true);
  const handleCloseAttendanceModal = () => setIsAttendanceModalOpen(false);

  const handleDeleteClick = async (id: number, name: string) => {
    setSelectedEmployee({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return null;
    try {
      setIsDeleting(true);
      await EmployeeService.deleteEmployee(selectedEmployee.id);
      toast.success("Employee Deleted", {
        description: `${selectedEmployee.name} has been removed.`,
      });
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to delete employee :" + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = employees?.filter((item) => {
    const name = item.name.toLowerCase().includes(search.toLowerCase());
    return name;
  });

  const columns = EmployeeColumns(handleDeleteClick);

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <StatsCard
          title="Total Employees"
          value={totalItems || 0}
          icon={<Users className="w-6 h-6" />}
          iconColor="text-primary-brand"
          iconBgColor="bg-primary-brand/10"
        />
        <StatsCard
          title="Total Daily Salary"
          value={formatRupiah(employeeStats.total_daily_salary || 0)}
          icon={<DollarSign className="w-6 h-6" />}
          iconColor="text-emerald-500"
          iconBgColor="bg-emerald-500/10"
        />
      </div>
      <div className="bg-snow-white rounded-xl shadow-xs border border-brand-dark/30 overflow-hidden">
        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all border border-zinc-200/50 dark:border-white/10 cursor-pointer">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1" />
          </div>

          <div className="group w-full sm:max-w-xs flex items-center bg-ghost-white border border-brand-dark/50 rounded-xl px-3 focus-within:border-brand-dark transition-all">
            <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-brand-dark transition-colors" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-2 pr-2 py-2.5 bg-transparent text-xs focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedEmployee?.name}?`}
        isLoading={isDeleting}
        type="delete"
      />
      <div className="flex items-start">
        <span className="text-xl font-bold text-brand-dark md:text-2xl mt-3.5 ml-3.5">
          Employee List
        </span>
      </div>
      <div className="w-full overflow-auto">
        <TableData
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination={{
            currentPage: currentPage,
            lastPage: lastPage,
            totalItems: totalItems,
            onPageChange: (newPage) => setCurrentPage(newPage),
          }}
        />
      </div>
    </div>
  );
}
