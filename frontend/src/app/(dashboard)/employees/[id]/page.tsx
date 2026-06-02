"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { EmployeeService } from "@/services/employeeService";
import { Employee } from "@/types/employee";
import { toast } from "sonner";
import axios from "axios";
import { formatDate, formatRupiah } from "@/utils/helper";
import { ArrowLeft, Clock, FilePen, DollarSign, Calendar } from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import StatsCard from "@/components/ui/card/StatsCard";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const data = await EmployeeService.getEmployee(id);
        setEmployee(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        toast.error("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const presentAttendanceThisMonth =
    employee?.attendance?.filter((item) => {
      if (!item.attendace_date) return false;
      const attendanceDate = new Date(item.attendace_date);
      return (
        item.status === "present" &&
        attendanceDate.getMonth() === currentMonth &&
        attendanceDate.getFullYear() === currentYear
      );
    }) || [];
  const dailySalary = employee?.salary || 0;
  const totalPeriodSalary = presentAttendanceThisMonth.length * dailySalary;

  const getRecentAttendance = employee?.attendance
    ? employee.attendance.slice(-5).reverse()
    : [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="w-full border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-none">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors group"
            >
              <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] pl-1 hidden xs:inline">
                Back
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-none">
            <ButtonNav
              href={`/employees/${id}/edit`}
              className="px-3 py-2 text-xs sm:text-sm font-medium"
              icon={<FilePen className="w-3.5 h-3.5" />}
            >
              Edit
            </ButtonNav>
          </div>
        </div>
      </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <StatsCard
          title="Present"
          value={presentAttendanceThisMonth.length}
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

      <div className="bg-snow-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mt-2">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-primary" />
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-dark">
            Recent Attendances for {employee?.name}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-primary-brand">
              <tr className="text-ghost-white text-xs font-black uppercase tracking-widest">
                <th className="py-3 px-4">No / ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-slate-400 font-medium animate-pulse"
                  >
                    Loading attendance records...
                  </td>
                </tr>
              ) : getRecentAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-slate-400 font-medium"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                getRecentAttendance.map((attendance, index) => {
                  const isEven = index % 2 === 0;
                  let statusClasses =
                    "bg-slate-50 text-slate-600 border-slate-200";
                  if (attendance.status === "present") {
                    statusClasses =
                      "bg-emerald-50 text-emerald-600 border-emerald-200";
                  } else if (attendance.status === "absent") {
                    statusClasses = "bg-red-50 text-red-600 border-red-200";
                  } else if (attendance.status?.startsWith("leave")) {
                    statusClasses =
                      "bg-amber-50 text-amber-600 border-amber-200";
                  }

                  return (
                    <tr
                      key={attendance.id || index}
                      className={`transition-colors duration-200 hover:bg-brand-primary/20 text-brand-dark font-medium ${
                        isEven ? "bg-background/40" : "bg-snow-white"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold tracking-wide">
                        {attendance.id ? `#${attendance.id}` : index + 1}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(attendance.attendace_date)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${statusClasses}`}
                        >
                          {attendance.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-normal italic text-xs">
                        {attendance.notes || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
