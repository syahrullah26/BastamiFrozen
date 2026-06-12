"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ExpenseService } from "@/services/expenseService";
import { Expense } from "@/types/expense";

import { typeConfig } from "@/constants/config/TypeExpenseConfig";

import { FileText } from "lucide-react";
import GlobalLoader from "@/components/ui/common/GlobalLoading";
import HeaderExpenseDetail from "./_components/HeaderExpenseDetail";
import BasicInfoExpenseDetail from "./_components/BasicInfoExpenseDetail";
import AmountExpenseDetail from "./_components/AmountExpenseDetail";

export default function ExpenseDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === "undefined") return;
    const loadExpense = async () => {
      try {
        setLoading(true);
        const data = await ExpenseService.getExpense(id);
        setExpense(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load expense");
      } finally {
        setLoading(false);
      }
    };
    loadExpense();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <GlobalLoader message="Loading..." />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center gap-2 text-zinc-400">
        <FileText className="w-8 h-8 stroke-1.5" />
        <span className="text-xs font-medium">Expense data not found</span>
      </div>
    );
  }

  const currentType = typeConfig[expense.type] || {
    label: expense.type?.replace(/_/g, " ") || "Unknown",
    className: "bg-zinc-50 text-zinc-600 border-zinc-200",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <HeaderExpenseDetail expense={expense} currentType={currentType} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <BasicInfoExpenseDetail expense={expense} />

        <AmountExpenseDetail expense={expense} />
      </div>
    </div>
  );
}
