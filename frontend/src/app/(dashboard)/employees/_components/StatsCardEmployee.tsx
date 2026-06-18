"use client";
import React, { useSyncExternalStore } from "react";
import { EmployeeStats } from "@/types/employee";
import { formatRupiah } from "@/utils/helper";
import StatsCard from "@/components/ui/card/StatsCard";
import { DollarSign, Users } from "lucide-react";

interface StatsCardEmployeeProps {
  employeeStats: EmployeeStats;
  totalItems: number;
}

const emptySubscribe = () => () => {};
export default function StatsCardEmployee({
  employeeStats,
  totalItems,
}: StatsCardEmployeeProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  return (
    <>
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
          value={
            isClient ? formatRupiah(employeeStats.total_daily_salary) : "Rp 0"
          }
          icon={<DollarSign className="w-6 h-6" />}
          iconColor="text-emerald-500"
          iconBgColor="bg-emerald-500/10"
        />
      </div>
    </>
  );
}
