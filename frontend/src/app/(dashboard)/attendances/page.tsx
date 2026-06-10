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
  Check,
  X,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { AttendanceColumns } from "@/constants/DataTable/attendanceData";
import { AttendanceForm } from "@/components/ui/form/AttendanceForm";
import { formatRupiah } from "@/utils/helper";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { TYPEATTENDANCE_TABS_CONFIG } from "@/constants/Filter/TypeAttendanceFilterConfig";
import HeaderAttendance from "./_components/HeaderAttendance";
import StatsAttendance from "./_components/StatsAttendance";
import FilterAttendance from "./_components/FilterAttendance";
import ActiveTabAttendance from "./_components/ActiveTabAttendance";

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

  const [activeTab, setActiveTab] = useState<string>("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total_present: 0,
    total_absent: 0,
    total_leave: 0,
    total_salary_expense: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(
    async (
      pageNumber = 1,
      activeTab: string = "monthly",
      startDate?: string,
      endDate?: string,
    ) => {
      try {
        setLoading(true);
        const data = await AttendanceService.getAttendances(
          pageNumber,
          startDate,
          endDate,
          activeTab === "history" ? "history" : "monthly",
        );
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
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(currentPage, activeTab, startDate, endDate);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData, currentPage, activeTab, startDate, endDate]);

  const handleTabChange = (status: string) => setActiveTab(status);
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
      <HeaderAttendance
        handleOpenModal={handleOpenModal}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        handleSuccess={handleSuccess}
      />

      <StatsAttendance attendanceStats={attendanceStats} />

      <FilterAttendance
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        search={search}
        setSearch={setSearch}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAttendance}
        title="Delete Attendance"
        message={`Are you sure you want to delete this attendance : ${selectedAttendance?.name} ?`}
        type="delete"
        isLoading={isDeleting}
      />

      <ActiveTabAttendance
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        TYPEATTENDANCE_TABS_CONFIG={TYPEATTENDANCE_TABS_CONFIG}
      />

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
