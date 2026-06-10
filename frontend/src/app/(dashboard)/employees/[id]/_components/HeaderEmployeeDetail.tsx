"use client";
import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { ArrowLeft, FilePen } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderEmployeeDetailProps {
  id: string | number;
}

export default function HeaderEmployeeDetail({
  id,
}: HeaderEmployeeDetailProps) {
  const router = useRouter();
  return (
    <>
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
    </>
  );
}
