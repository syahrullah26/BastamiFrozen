"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { AttendanceService } from "@/services/attendanceService"; // Asumsi nama service Anda

import { FileText, Clock } from "lucide-react";
import { Attendance } from "@/types/employee";
import GlobalLoader from "@/components/ui/common/GlobalLoading";
import HeaderAttendanceDetail from "./_components/HeaderAttendanceDetail";
import InformationAttendanceDetail from "./_components/InformationAttendanceDetail";
import { statusConfig } from "@/constants/config/StatusAttendanceConfig";

export default function AttendanceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === "undefined") return;
    const loadAttendance = async () => {
      try {
        setLoading(true);
        const data = await AttendanceService.getAttendance(id);
        setAttendance(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load attendance details");
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <GlobalLoader message="Loading..." />
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center gap-2 text-zinc-400">
        <FileText className="w-8 h-8 stroke-1.5" />
        <span className="text-xs font-medium">Attendance data not found</span>
      </div>
    );
  }

  const currentStatus = statusConfig[attendance.status] || {
    label: attendance.status || "Unknown",
    className: "bg-zinc-50 text-zinc-600 border-zinc-200",
    icon: <Clock className="w-3.5 h-3.5 text-zinc-400" />,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <HeaderAttendanceDetail
        currentStatus={currentStatus}
        attendance={attendance}
      />
      <InformationAttendanceDetail attendance={attendance} />
    </div>
  );
}
