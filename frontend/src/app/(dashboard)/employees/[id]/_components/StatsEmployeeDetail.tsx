"use client";
import React from "react";
import StatsCard from "@/components/ui/card/StatsCard";
import { formatRupiah } from "@/utils/helper";
import { Calendar, DollarSign } from "lucide-react";

interface StatsCardEmployeeDetailProps {
  presentAttendanceThisMonth: number;
  totalPeriodSalary: number;
}

export default function StatsCardEmployeeDetail({
  presentAttendanceThisMonth,
  totalPeriodSalary,
}: StatsCardEmployeeDetailProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      <StatsCard
        title="Present"
        value={presentAttendanceThisMonth}
        icon={<Calendar className="w-6 h-6" />}
        iconBgColor="bg-emerald-500/10"
        iconColor="text-emerald-500"
      />
      <StatsCard
        title="Total Period Salary"
        value={formatRupiah(totalPeriodSalary)}
        icon={<DollarSign className="w-6 h-6" />}
        iconBgColor="bg-primary-brand/10"
        iconColor="text-primary-brand"
      />
    </div>
  );
}
