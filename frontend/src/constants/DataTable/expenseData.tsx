import { Expense } from "@/types/expense";
import { formatRupiah, formatDate } from "@/utils/helper";
import Link from "next/link";
import { Pencil, FileText, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Table/dropdown-menu";

export const ExpenseColumns = (
  onDelete: (id: number, name: string) => void,
) => [
  {
    header: "Date",
    accessor: (item: Expense) => (
      <span className="text-xs font-semibold text-zinc-600 font-mono tracking-wide">
        {formatDate(item.expense_date)}
      </span>
    ),
  },
  {
    header: "Expense Info",
    accessor: (item: Expense) => {
      const typeConfig: Record<string, { label: string; className: string }> = {
        pay_supplier: {
          label: "Payment Supplier",
          className: "bg-amber-50 text-amber-700 border-amber-200/60",
        },
        utility: {
          label: "Utility",
          className: "bg-blue-50 text-blue-700 border-blue-200/60",
        },
        operational: {
          label: "Operational",
          className: "bg-purple-50 text-purple-700 border-purple-200/60",
        },
        salary: {
          label: "Salary / Wage",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        },
        other: {
          label: "Other Expense",
          className: "bg-zinc-50 text-zinc-600 border-zinc-200",
        },
      };
      const currentType = typeConfig[item.type] || {
        label: item.type?.replace(/_/g, " ") || "Unknown",
        className: "bg-zinc-50 text-zinc-600 border-zinc-200",
      };

      return (
        <div className="flex flex-col items-start justify-center gap-1.5 py-0.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 border font-sans text-[10px] font-black uppercase tracking-wider rounded-md ${currentType.className}`}
          >
            {currentType.label}
          </span>
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider pl-0.5">
            #EXP-{item.id || "—"}
          </span>
        </div>
      );
    },
  },
  {
    header: "Amount",
    accessor: (item: Expense) => (
      <span className="text-xs font-bold text-zinc-800 font-mono">
        {formatRupiah(item.amount)}
      </span>
    ),
  },
  {
    header: "Notes",
    accessor: (item: Expense) => (
      <span className="text-xs font-medium text-zinc-500 line-clamp-2 max-w-xs break-words block">
        {item.notes || <span className="text-zinc-300 font-normal">—</span>}
      </span>
    ),
  },
  {
    header: "Actions",
    accessor: (item: Expense) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 flex items-center justify-center rounded-xl border border-zinc-200/60 bg-white text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all cursor-pointer定位 focus:outline-none">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 rounded-2xl shadow-xl border border-zinc-100 p-1.5 bg-white"
        >
          <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-2.5 py-1.5">
            Options Management
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-100 my-1" />

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-zinc-700 font-semibold text-xs focus:bg-zinc-50 focus:text-zinc-900 transition-colors"
          >
            <Link
              href={`/expenses/${item.id}`}
              className="flex items-center w-full"
            >
              <FileText className="mr-2 h-4 w-4 text-zinc-400 shrink-0" /> View
              Detail
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-zinc-700 font-semibold text-xs focus:bg-zinc-50 focus:text-zinc-900 transition-colors"
          >
            <Link
              href={`/expenses/${item.id}/edit`}
              className="flex items-center w-full"
            >
              <Pencil className="mr-2 h-4 w-4 text-zinc-400 shrink-0" /> Edit
              Expense
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-zinc-100 my-1" />

          <DropdownMenuItem
            onClick={() => onDelete(item.id, item.type)}
            className="cursor-pointer py-2 px-2.5 rounded-xl text-rose-600 font-bold text-xs focus:text-rose-700 focus:bg-rose-50 transition-colors flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4 text-rose-500 shrink-0" /> Delete
            Expense
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
