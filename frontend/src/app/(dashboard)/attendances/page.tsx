"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AttendanceService } from "@/services/attendanceService";
import { Attendance, AttendanceStats } from "@/types/employee";
import TableData from "@/components/ui/Table/TableData";
import ButtonNav from "@/components/ui/button/ButtonNav";
import StatsCard from "@/components/ui/card/StatsCard";
import {
  Plus,
  Search,
  Filter,
  Check,
  X,
  Clock,
  DollarSign,
} from "lucide-react";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { AttendanceColumns } from "@/constants/DataTable/attendanceData";
import { AttendanceForm } from "@/components/ui/form/AttendanceForm";
import { formatRupiah } from "@/utils/helper";
import { BaseModal } from "@/components/ui/modal/BaseModal";

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total_present: 0,
    total_absent: 0,
    total_leave: 0,
    total_salary_expense: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await AttendanceService.getAttendances(pageNumber);
      setAttendances(data.data.data || []);
      setCurrentPage(data.data.meta?.current_page || 1);
      setLastPage(data.data.meta?.last_page || 1);
      setTotalItems(data.data.meta?.total || 0);

      const metaStats = data.data.meta?.stats;
      if (metaStats) {
        setAttendanceStats({
          total_present: metaStats.total_present || 0,
          total_absent: metaStats.total_absent || 0,
          total_leave: metaStats.total_leave || 0,
          total_salary_expense: metaStats.total_salary_expense || 0,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      toast.error("Failed to load attendances");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(currentPage);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData, currentPage]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSuccess = () => loadData();

  const handleDeleteClick = useCallback((id: number, name: string) => {
    setSelectedAttendance({ id, name });
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteAttendance = async () => {
    if (!selectedAttendance) return;
    try {
      setIsDeleting(true);
      await AttendanceService.deleteAttendance(selectedAttendance.id);
      toast.success("Attendance Deleted", {
        description: `${selectedAttendance.name} has been removed.`,
      });
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to delete attendance: " + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const periodAttendances = attendances.filter((item) => {
      if (!item.attendace_date) return false;
      const attendanceDate = new Date(item.attendace_date);
      return (
        attendanceDate.getMonth() === currentMonth &&
        attendanceDate.getFullYear() === currentYear
      );
    });
    const present = periodAttendances.filter(
      (item) => item.status === "present",
    );
    const absent = periodAttendances.filter((item) => item.status === "absent");
    const leave = periodAttendances.filter((item) => item.status === "leave");
    const salary = present.reduce((total, item) => {
      const employeeSalary = Number(item.employee?.salary);
      const validSalary = isNaN(employeeSalary) ? 0 : employeeSalary;
      return total + validSalary;
    }, 0);

    return {
      presentCount: present.length,
      absentCount: absent.length,
      leaveCount: leave.length,
      totalSalary: salary,
    };
  }, [attendances]);

  const filteredData = useMemo(() => {
    return attendances.filter((item) => {
      const nameMatch = item.employee?.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const statusMatch = item.status
        ?.toLowerCase()
        .includes(search.toLowerCase());
      return nameMatch || statusMatch;
    });
  }, [attendances, search]);

  const column = useMemo(
    () => AttendanceColumns(handleDeleteClick),
    [handleDeleteClick],
  );

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
        <StatsCard
          title="Total Present"
          value={attendanceStats.total_present}
          icon={<Check className="w-6 h-6" />}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Total Absent"
          value={attendanceStats.total_absent}
          icon={<X className="w-6 h-6" />}
          iconBgColor="bg-red-50"
          iconColor="text-red-600"
        />
        <StatsCard
          title="Total Leave"
          value={attendanceStats.total_leave}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 md:gap-8 gap-4">
        <StatsCard
          title="Total Salary This Month"
          value={formatRupiah(attendanceStats.total_salary_expense)}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-tertiary-brand/10"
          iconColor="text-tertiary-brand"
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
              placeholder="Search attendances..."
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
        onConfirm={handleDeleteAttendance}
        title="Delete Attendance"
        message={`Are you sure you want to delete this attendance : ${selectedAttendance?.name} ?`}
        type="delete"
        isLoading={isDeleting}
      />

      <div className="flex items-start">
        <span className="text-xl font-bold text-brand-dark md:text-2xl mt-3.5 ml-3.5">
          Attendance List
        </span>
      </div>

      <div className="w-full overflow-auto">
        <TableData
          columns={column}
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
