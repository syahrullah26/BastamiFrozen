import { ExpenseBreakdown } from "@/types/financialReport";
import { formatRupiah } from "@/utils/helper";

export const expenseColumns = [
  {
    header: "Expense Category / Type",
    accessor: (row: ExpenseBreakdown) => {
      const isSupplier = row.category === "pay_supplier";

      return (
        <div className="flex items-center gap-2.5 py-1">
          <span
            className={`w-2.5 h-2.5 rounded-full ${isSupplier ? "bg-amber-500" : "bg-indigo-500"}`}
          />

          <div className="flex flex-col">
            <span className="capitalize font-semibold text-gray-800 tracking-wide">
              {row.category.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-gray-400">
              {isSupplier ? "Supplier Procurement" : "Operational Cost"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    header: "Total Allocation",
    accessor: (row: ExpenseBreakdown) => (
      <div className="flex flex-col items-start justify-center gap-0.5 py-1">
        <span className="text-red-600 font-bold text-sm tracking-wide">
          {formatRupiah(row.total)}
        </span>
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          Debited from Cash
        </span>
      </div>
    ),
  },
];
