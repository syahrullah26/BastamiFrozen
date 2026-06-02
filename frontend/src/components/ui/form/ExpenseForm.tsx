"use client";

import React, { useState } from "react";
import axios from "axios";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save } from "lucide-react";
import { ExpenseRequest } from "@/types/expense";
import { ExpenseService } from "@/services/expenseService";
import { toast } from "sonner";
import ButtonLoad from "@/components/ui/button/ButtonLoad";

interface ExpenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ExpenseForm = ({ onSuccess, onCancel }: ExpenseFormProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setType(selectedType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: ExpenseRequest = {
      type: type,
      expense_date: expenseDate,
      amount: amount,
      notes: notes,
    };
    try {
      await ExpenseService.createExpense(payload);
      toast.success("Expense Created", {
        description: `${type} has been added successfully.`,
      });
      onSuccess();
      onCancel();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to Create Expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-ghost-white/30 rounded-2xl border-t border-foreground/30 border-b border-b-foreground/30 p-6 shadow-xl"
    >
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-dar">
          Attendacnces
        </h3>
        <div className="grid grid-cols-1 gap-4 ">
          <div className="flex flex-col gap-2 w-full ">
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-dark/70 pl-0.5">
              Select Type
            </label>
            <div className="group relative w-full bg-ghost-white border border-foreground/30 hover:border-brand-dark/40 focus-within:border-brand-dark rounded-xl px-3.5 transition-all duration-300 focus-within:ring-4 focus-within:ring-brand-dark/5 shadow-sm">
              <select
                value={type}
                onChange={handleTypeChange}
                className="w-full h-full py-2 bg-transparent focus:outline-none text-sm"
              >
                <option value="">Select Expense Type</option>
                <option value="utility">Utility</option>
                <option value="operational">Operational</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
        <FloatingInput
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <FloatingInput
          label="Expense Date"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
        />
        <FloatingInput
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-foreground/30  mt-6">
        <ButtonLoad
          isLoading={loading}
          fullWidth={false}
          loadingText="Saving..."
          icon={<Save className="w-4 h-4" />}
          type="submit"
        >
          {" "}
          Save Customer
        </ButtonLoad>
      </div>
    </form>
  );
};
