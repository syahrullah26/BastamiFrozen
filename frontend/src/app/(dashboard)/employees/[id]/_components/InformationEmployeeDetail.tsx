"use client";
import React from "react";
import { Employee } from "@/types/employee";
import { formatRupiah } from "@/utils/helper";
import EmptyState from "@/components/ui/common/EmptyState";

interface InformationEmployeeDetailProps {
  employee: Employee | null;
  totalPeriodSalary: number;
}

export default function InformationEmployeeDetail({
  employee,
  totalPeriodSalary,
}: InformationEmployeeDetailProps) {
  return (
    <>
      {!employee && (
        <div>
          <EmptyState />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-snow-white p-6 rounded-xl border border-foreground/30 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
            Employee Profile
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark mt-1">
            {employee?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            {formatRupiah(employee?.salary as number) || "-"}
          </p>
        </div>
        <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
            Total Period Salary
          </span>
          <span className="text-2xl font-black text-brand-dark block mt-1">
            {formatRupiah(totalPeriodSalary)}
          </span>
        </div>
      </div>
    </>
  );
}
