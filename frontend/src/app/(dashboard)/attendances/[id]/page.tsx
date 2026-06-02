"use client";
import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { AttendanceService } from "@/services/attendanceService"; // Asumsi nama service Anda
import { formatRupiah, formatDate } from "@/utils/helper";

import {
  ArrowLeft,
  FilePen,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  Building,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { Attendance } from "@/types/employee";

const emptySubscribe = () => () => {};

export default function AttendanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!id || id === "undefined") return;
    const loadAttendance = async () => {
      try {
        setLoading(true);
        // Sesuaikan endpoint service dengan method pemicu data Anda
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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
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

  const statusConfig: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    present: {
      label: "Present",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
    },
    absent: {
      label: "Absent",
      className: "bg-rose-50 text-rose-700 border-rose-200/60",
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    leave: {
      label: "Sick Leave",
      className: "bg-amber-50 text-amber-700 border-amber-200/60",
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
    },
    leave_with_permission: {
      label: "Permitted Leave",
      className: "bg-sky-50 text-sky-700 border-sky-200/60",
      icon: <Clock className="w-3.5 h-3.5 text-sky-600" />,
    },
  };

  const currentStatus = statusConfig[attendance.status] || {
    label: attendance.status || "Unknown",
    className: "bg-zinc-50 text-zinc-600 border-zinc-200",
    icon: <Clock className="w-3.5 h-3.5 text-zinc-400" />,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <div className="w-full border-b border-zinc-100 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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
            <div className="h-5 w-px bg-zinc-200 hidden xs:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-zinc-800">
                  Attendance Log
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-black uppercase tracking-wider rounded-md ${currentStatus.className}`}
                >
                  {currentStatus.icon}
                  {currentStatus.label}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                #ATT-{attendance.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ButtonNav
              href={`/attendances/${attendance.id}/edit`}
              icon={<FilePen className="w-3.5 h-3.5" />}
              fullWidth={false}
            >
              Edit Log
            </ButtonNav>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-5">
          <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
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
                <span className="text-base font-black text-zinc-800 tracking-tight">
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
                <span className="font-bold text-zinc-800 font-mono">
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
                  {attendance.notes ||
                    "No extra notes recorded for this shift."}
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
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
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
                  <span className="font-mono font-black text-emerald-600 text-xs bg-emerald-50 px-1.5 py-0.5 rounded">
                    {formatRupiah(Number(attendance.expense.amount))}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5">
                  <span className="text-zinc-400">Payout Date</span>
                  <span className="font-mono text-zinc-600">
                    {isClient
                      ? formatDate(attendance.expense.expense_date)
                      : "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-t border-zinc-100 pt-2.5">
                  <span className="text-zinc-400 text-[10px]">
                    Expense Narrative
                  </span>
                  <p className="text-[10px] text-zinc-500 font-normal leading-normal bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    {attendance.expense.notes}
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
                  This attendance log did not trigger an automated salary
                  expense ledger entry.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
