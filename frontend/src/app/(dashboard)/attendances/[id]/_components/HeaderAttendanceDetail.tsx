"use client";

import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { ArrowLeft, FilePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { Attendance } from "@/types/employee";

interface CurrentStatus {
  label: string;
  className: string;
  icon: React.ReactNode;
}
interface HeaderAttendanceDetailProps {
  currentStatus: CurrentStatus;
  attendance: Attendance;
}

export default function HeaderAttendanceDetail({
  currentStatus,
  attendance,
}: HeaderAttendanceDetailProps) {
  const router = useRouter();
  if (!currentStatus) return null;
  if (!attendance) return null;

  return (
    <>
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
    </>
  );
}
