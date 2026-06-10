"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FilePen } from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";

interface ExpenseTypeConfig {
  label: string;
  className: string;
}

interface ExpenseDetailData {
  id: string | number;
}

interface HeaderExpenseDetailProps {
  expense: ExpenseDetailData;
  currentType: ExpenseTypeConfig;
}

export default function HeaderExpenseDetail({
  expense,
  currentType,
}: HeaderExpenseDetailProps) {
  const router = useRouter();

  return (
    <div className="w-full border-b border-zinc-100 pb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 cursor-pointer transition-colors group"
          >
            <div className="p-1.5 rounded-xl group-hover:bg-zinc-100 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest pl-1 hidden xs:inline">
              Back
            </span>
          </button>
          <div className="h-5 w-px bg-zinc-200 hidden xs:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-zinc-900">
                Expense Voucher
              </h1>
              <span
                className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded-md ${currentType.className}`}
              >
                {currentType.label}
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              #EXP-{expense.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ButtonNav
            href={`/expenses/${expense.id}/edit`}
            className="px-3 py-2 text-xs font-semibold rounded-xl"
            icon={<FilePen className="w-3.5 h-3.5" />}
            variant="neutral"
            fullWidth={false}
          >
            Edit Details
          </ButtonNav>
        </div>
      </div>
    </div>
  );
}
