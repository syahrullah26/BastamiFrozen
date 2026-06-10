"use client";

import React from "react";
import { Employee } from "@/types/employee";
import { Attendance } from "@/types/employee";
import { Clock, Calendar } from "lucide-react";
import { formatDate } from "@/utils/helper";
import GlobalLoader from "@/components/ui/common/GlobalLoading";

interface TableEmployeeDetailProps {
  employee: Employee | null;
  recentAttendance: Attendance[] | null;
  loading: boolean;
}

export default function TableEmployeeDetail({
  employee,
  recentAttendance,
  loading,
}: TableEmployeeDetailProps) {
  return (
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
                  <GlobalLoader message="Loading..." />
                </td>
              </tr>
            ) : !recentAttendance || recentAttendance.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-slate-400 font-medium"
                >
                  No attendance records found.
                </td>
              </tr>
            ) : (
              recentAttendance.map((attendance, index) => {
                const isEven = index % 2 === 0;
                let statusClasses =
                  "bg-slate-50 text-slate-600 border-slate-200";
                if (attendance.status === "present") {
                  statusClasses =
                    "bg-emerald-50 text-emerald-600 border-emerald-200";
                } else if (attendance.status === "absent") {
                  statusClasses = "bg-red-50 text-red-600 border-red-200";
                } else if (attendance.status?.startsWith("leave")) {
                  statusClasses = "bg-amber-50 text-amber-600 border-amber-200";
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
  );
}
