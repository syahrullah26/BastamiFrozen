"use client";

import React from "react";
import { AttendanceStats } from "@/types/employee";
import { formatRupiah } from "@/utils/helper";
import StatsCard from "@/components/ui/card/StatsCard";
import { Check, X, Clock, DollarSign } from "lucide-react";

interface StatsAttendanceProps {
  attendanceStats: AttendanceStats | null;
}

export default function StatsAttendance({
  attendanceStats,
}: StatsAttendanceProps) {
  if (!attendanceStats) {
    return null;
  }

  return (
    <>
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
    </>
  );
}
