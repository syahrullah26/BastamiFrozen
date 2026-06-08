"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import { ExpenseService } from "@/services/expenseService";
import { Expense, ExpenseStats } from "@/types/expense";
import { ExpenseColumns } from "@/constants/DataTable/expenseData";
import TableData from "@/components/ui/Table/TableData";
import ButtonNav from "@/components/ui/button/ButtonNav";
import {
  Plus,
  Search,
  Filter,
  FileText,
  FileBox,
  BanknoteArrowDown,
} from "lucide-react";
import StatsCard from "@/components/ui/card/StatsCard";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { ExpenseForm } from "@/components/ui/form/ExpenseForm";
import { formatRupiah } from "@/utils/helper";

const emptySubscribe = () => () => {};
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

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Expenses
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your expenses
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ButtonNav
            onClick={handleOpenModal}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
          >
            Add Expense
          </ButtonNav>
        </div>
        <BaseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Add Sales"
          size="lg"
        >
          <ExpenseForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
        </BaseModal>
      </div>
      <section className="space-y-4 rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-3xs">
        <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800">
            Stats This Month
          </h2>
          <p className="text-[11px] font-medium text-zinc-400">
            Overview of your financial outlays and expenses recorded for the
            current period.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <StatsCard
            title="Total Expenses"
            value={
              isClient
                ? formatRupiah(expenseStats.total_monthly_expense)
                : "Rp 0"
            }
            icon={<BanknoteArrowDown className="w-5 h-5 stroke-1.5" />}
            iconBgColor="bg-primary-brand/10"
            iconColor="text-primary-brand"
          />

          <StatsCard
            title="Total Salary"
            value={
              isClient
                ? formatRupiah(expenseStats.total_monthly_salary_expense)
                : "Rp 0"
            }
            icon={<FileText className="w-5 h-5 stroke-1.5" />}
            iconBgColor="bg-tertiary-brand/10"
            iconColor="text-tertiary-brand"
          />

          <StatsCard
            title="Total Payment"
            value={
              isClient
                ? formatRupiah(expenseStats.total_monthly_supplier_expense)
                : "Rp 0"
            }
            icon={<FileBox className="w-5 h-5 stroke-1.5" />}
            iconBgColor="bg-emerald-500/10"
            iconColor="text-emerald-500"
          />
        </div>
      </section>

      <div className="bg-snow-white rounded-xl shadow-xs border border-brand-dark/30 overflow-hidden">
        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all border border-zinc-200/50 dark:border-white/10 cursor-pointer">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1" />
          </div>

          <div className="group w-full sm:max-w-xs flex items-center bg-ghost-white border border-brand-dark/50 rounded-xl px-3 focus-within:border-brand-dark transition-all">
            <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-brand-dark transition-colors" />
            <input
              type="text"
              placeholder="Search sales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-2 pr-2 py-2.5 bg-transparent text-xs focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteExpense}
        isLoading={isDeleting}
        title="Delete Expense"
        message={`Are you sure you want to delete ${selectedExpense?.name}?`}
        type="delete"
      />
      <div className="flex items-start">
        <span className="text-xl font-bold text-brand-dark md:text-2xl mt-3.5 ml-3.5">
          Your Expenses List
        </span>
      </div>
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
