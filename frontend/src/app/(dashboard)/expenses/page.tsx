"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ExpenseService } from "@/services/expenseService";
import { Expense, ExpenseStats } from "@/types/expense";
import { ExpenseColumns } from "@/constants/DataTable/expenseData";
import TableData from "@/components/ui/Table/TableData";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import HeaderExpense from "./_components/HeaderExpense";
import StatsExpense from "./_components/StatsExpense";
import TableHeaderExpense from "./_components/TableHeaderExpense";

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expenseStats, setExpenseStats] = useState<ExpenseStats>({
    total_monthly_expense: 0,
    total_monthly_salary_expense: 0,
    total_monthly_supplier_expense: 0,
  });

  const loadData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await ExpenseService.getExpenses(pageNumber);
      setExpenses(data.data.data);
      setCurrentPage(data.data.meta?.current_page || 1);
      setLastPage(data.data.meta?.last_page || 1);
      setTotalItems(data.data.meta?.total || 0);

      const metaStats = data.data.meta?.stats;
      if (metaStats) {
        setExpenseStats({
          total_monthly_expense: metaStats.total_monthly_expense || 0,
          total_monthly_salary_expense:
            metaStats.total_monthly_salary_expense || 0,
          total_monthly_supplier_expense:
            metaStats.total_monthly_supplier_expense || 0,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await loadData(currentPage);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [loadData, currentPage]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSuccess = () => loadData();

  const handleDeleteClick = useCallback((id: number, name: string) => {
    setSelectedExpense({ id, name });
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return null;
    try {
      setIsDeleting(true);
      await ExpenseService.deleteExpense(selectedExpense.id);
      toast.success("Expense Deleted", {
        description: `${selectedExpense.name} has been removed.`,
      });
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to delete expense :" + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = useMemo(() => {
    return expenses.filter((expense) => {
      const type = expense.type.toLowerCase().includes(search.toLowerCase());
      const amount = expense.amount
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase());
      return type || amount;
    });
  }, [expenses, search]);

  const columns = useMemo(
    () => ExpenseColumns(handleDeleteClick),
    [handleDeleteClick],
  );

  const TableHeaderExpenseComponent =
    TableHeaderExpense as unknown as React.ComponentType<{
      search: string;
      setSearch: React.Dispatch<React.SetStateAction<string>>;
      placeholder?: string;
    }>;

  return (
    <div className="space-y-6">
      <HeaderExpense
        handleOpenModal={handleOpenModal}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        handleSuccess={handleSuccess}
      />

      <StatsExpense expenseStats={expenseStats} />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteExpense}
        isLoading={isDeleting}
        title="Delete Expense"
        message={`Are you sure you want to delete ${selectedExpense?.name}?`}
        type="delete"
      />
      <TableHeaderExpenseComponent search={search} setSearch={setSearch} />

      <div className="w-full overflow-auto">
        <TableData
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination={{
            currentPage: currentPage,
            lastPage: lastPage,
            totalItems: totalItems,
            onPageChange: (newPage) => setCurrentPage(newPage),
          }}
        />
      </div>
    </div>
  );
}
