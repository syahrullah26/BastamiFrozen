"use client";

import React, { useSyncExternalStore } from "react";
import { User, Calendar, Wallet, FileText, Building } from "lucide-react";
import { formatDate, formatRupiah } from "@/utils/helper";
import { Attendance } from "@/types/employee";

interface InformationAttendanceDetailProps {
  attendance: Attendance;
}

const emptySubscribe = () => () => {};

export default function InformationAttendanceDetail({
  attendance,
}: InformationAttendanceDetailProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-7 space-y-5">
        <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
            Employee & Shift Info
          </h3>

          <div className="flex items-center gap-3 bg-zinc-50/60 border border-zinc-100 p-4 rounded-xl">
            <div className="p-2.5 bg-white border border-zinc-200/60 text-zinc-700 rounded-xl shadow-3xs shrink-0">
              <User className="w-5 h-5 stroke-1.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Employee Name
              </span>
              <span className="text-base font-bold text-zinc-900 tracking-tight">
                {attendance.employee?.name || "Unknown Staff"}
              </span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Attendance Date</span>
              </div>
              <span className="font-semibold text-zinc-700 font-mono">
                {isClient ? formatDate(attendance.attendace_date) : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-100 pt-3.5 py-0.5">
              <div className="flex items-center gap-2 text-zinc-400">
                <Wallet className="w-4 h-4 text-zinc-400" />
                <span>Base Daily Salary</span>
              </div>
              <span className="font-bold text-zinc-900 font-mono">
                {isClient && attendance.employee?.salary
                  ? formatRupiah(Number(attendance.employee.salary))
                  : "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-3.5">
              <div className="flex items-center gap-2 text-zinc-400">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Attendance Notes</span>
              </div>
              <p className="bg-zinc-50/30 border border-zinc-100/70 rounded-xl p-3 text-zinc-600 font-medium leading-relaxed italic text-[11px]">
                {attendance.notes || "No extra notes recorded for this shift."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-5 space-y-5">
        {attendance.expense ? (
          <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Linked Salary Expense
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Voucher ID: #EXP-{attendance.expense.id}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-[11px] font-medium">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Disbursed Amount</span>
                <span className="font-mono font-bold text-emerald-600 text-xs bg-emerald-50 px-1.5 py-0.5 rounded">
                  {formatRupiah(Number(attendance.expense.amount))}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5">
                <span className="text-zinc-400">Payout Date</span>
                <span className="font-mono text-zinc-600">
                  {isClient ? formatDate(attendance.expense.expense_date) : "—"}
                </span>
              </div>

              <div className="flex flex-col gap-1 border-t border-zinc-100 pt-2.5">
                <span className="text-zinc-400 text-[10px]">
                  Expense Narrative
                </span>
                <p className="text-[10px] text-zinc-500 font-normal leading-normal bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                  {attendance.expense.notes || "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 h-full min-h-45">
            <Building className="w-5 h-5 text-zinc-300 stroke-1.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-zinc-500">
                No Payout Generated
              </p>
              <p className="text-[10px] text-zinc-400 max-w-47.5 mx-auto leading-normal">
                This attendance log did not trigger an automated salary expense
                ledger entry.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
