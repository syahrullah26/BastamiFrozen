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
import HeaderEmployee from "./_components/HeaderEmployee";
import StatsCardEmployee from "./_components/StatsCardEmployee";
import TableHeaderEmployee from "./_components/TableHeaderEmployee";

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
      <HeaderEmployee
        handleOpenModal={handleOpenModal}
        handleOpenAttendanceModal={handleOpenAttendanceModal}
        isModalOpen={isModalOpen}
        isAttendanceModalOpen={isAttendanceModalOpen}
        handleCloseAttendanceModal={handleCloseAttendanceModal}
        handleCloseModal={handleCloseModal}
        handleSuccess={handleSuccess}
      />

      <StatsCardEmployee
        employeeStats={employeeStats}
        totalItems={totalItems}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedEmployee?.name}?`}
        isLoading={isDeleting}
        type="delete"
      />

      <TableHeaderEmployee
        search={search}
        setSearch={setSearch}
        placeholder="Search Employee..."
      />
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
