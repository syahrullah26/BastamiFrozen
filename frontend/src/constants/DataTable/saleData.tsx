import { Sale } from "@/types/sale";
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
import { formatDate, formatRupiah } from "@/utils/helper";

export const SaleColumns = (onDelete: (id: number, name: string) => void) => [
  {
    header: "Invoice & Customer",
    accessor: (item: Sale) => (
      <div className="flex flex-col gap-0.5 py-1 min-w-50">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 font-mono">
          {item.customer?.name || "No Customer"}
        </span>
        <Link
          href={`/sales/${item.id}`}
          className="text-[11px] font-medium text-zinc-400 line-clamp-1 max-w-45 cursor-pointer hover:text-primary-brand transition-colors hover:underline hover:scale-105"
        >
          {item.invoice_number}
        </Link>
      </div>
    ),
  },
  {
    header: "Date",
    accessor: (item: Sale) => (
      <div className="flex max-w-62.5">
        <span className="text-xs font-semibold text-zinc-600 font-mono">
          {formatDate(item.transaction_date)}
        </span>
      </div>
    ),
  },
  {
    header: "Items & Profitability",
    accessor: (item: Sale) => (
      <div className="flex flex-col gap-3 max-h-48 overflow-y-auto py-1.5 min-w-70 scrollbar-thin pr-1 text-xs">
        {item.items && item.items.length > 0 ? (
          item.items.map((p) => {
            const itemProfit = Number(p.gross_profit || 0);
            const isLoss = itemProfit < 0;
            const isBreakeven = itemProfit === 0;
            const pricePerUnit =
              Number(p.price) / Number(p.conversion_factor || 1);

            return (
              <div
                key={p.id}
                className="flex flex-col gap-2 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-start gap-2 px-0.5">
                  <span
                    className="font-bold text-zinc-800 line-clamp-1 max-w-[75%]"
                    title={p.product_name}
                  >
                    {p.product_name}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-zinc-100 font-mono text-[10px] font-bold text-zinc-600 rounded-md shrink-0">
                    x{p.quantity} {p.unit}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 bg-zinc-50/70 p-2 rounded-xl border border-zinc-200/40 font-medium">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-400">
                        Sell Price
                      </span>
                      {pricePerUnit &&
                        Number(pricePerUnit) !== Number(p.price) && (
                          <span className="font-mono text-[9px] text-zinc-400 bg-white border border-zinc-200/60 px-1 py-0.2 rounded font-normal scale-95 origin-left">
                            {formatRupiah(Number(pricePerUnit))}/ut
                          </span>
                        )}
                    </div>
                    <span className="font-mono font-semibold text-zinc-800">
                      {formatRupiah(Number(p.price))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-200/30 pt-1.5">
                    <span className="text-[10px] text-zinc-400">Cost Base</span>
                    <span className="font-mono text-zinc-600">
                      {formatRupiah(Number(p.cost_price_at_sale || 0))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-200/30 pt-1.5">
                    <span className="text-[10px] text-zinc-400">Subtotal</span>
                    <span className="font-mono font-bold text-zinc-800">
                      {formatRupiah(Number(p.subtotal || 0))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-200/30 pt-1.5">
                    <span className="text-[10px] text-zinc-400">Status</span>
                    <span
                      className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isLoss
                          ? "text-rose-600 bg-rose-50 border border-rose-100"
                          : isBreakeven
                            ? "text-zinc-600 bg-zinc-100 border border-zinc-200"
                            : "text-emerald-600 bg-emerald-50 border border-emerald-100"
                      }`}
                    >
                      {!isLoss && !isBreakeven && "+"}
                      {formatRupiah(itemProfit)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-4 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
            <span className="italic text-zinc-400 text-[11px]">
              No items listed
            </span>
          </div>
        )}
      </div>
    ),
  },
  {
    header: "Total Amount",
    accessor: (item: Sale) => (
      <span className="inline-flex items-center px-2.5 py-1 bg-zinc-50 text-zinc-800 text-xs font-bold rounded-full border border-zinc-200/50 font-mono">
        {formatRupiah(Number(item.amount?.total_amount || 0))}
      </span>
    ),
  },
  {
    header: "Remaining Bill",
    accessor: (item: Sale) => {
      const bill = Number(item.amount?.remaining_bill || 0);

      if (bill === 0) {
        return (
          <span className="inline-flex items-center px-2.5 py-1 bg-zinc-50 text-zinc-400 text-[11px] font-medium rounded-full border border-zinc-200/40">
            Clear
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100 font-mono">
          {formatRupiah(bill)}
        </span>
      );
    },
  },
  {
    header: "Total Profit",
    accessor: (item: Sale) => {
      const totalProfit = (item.items || []).reduce((total: number, p) => {
        const profitValue = Number(p.gross_profit || 0);
        const validProfit = isNaN(profitValue) ? 0 : profitValue;
        return total + validProfit;
      }, 0);

      if (totalProfit === 0) {
        return (
          <span className="text-xs font-medium text-zinc-400 font-mono">-</span>
        );
      }

      const isLoss = totalProfit < 0;

      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 text-xs font-black rounded-full border font-mono ${
            isLoss
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          }`}
        >
          {isLoss ? "" : "+"}
          {formatRupiah(totalProfit)}
        </span>
      );
    },
  },
  {
    header: "Status",
    accessor: (item: Sale) => {
      const isPaid = item.status === "paid";
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 font-sans font-bold uppercase tracking-wider rounded-md text-[9px] ${
            isPaid
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}
        >
          {item.status}
        </span>
      );
    },
  },
  {
    header: "Actions",
    accessor: (item: Sale) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 flex items-center justify-center rounded-xl border border-zinc-200/60 bg-white text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer focus:outline-none">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 rounded-2xl shadow-xl border-zinc-100 p-1.5 bg-white"
        >
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1.5">
            Options Management
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-100 my-1" />

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-zinc-700 font-semibold text-xs focus:bg-zinc-50 focus:text-zinc-900 transition-colors"
          >
            <Link href={`/sales/${item.id}`}>
              <FileText className="mr-2 h-4 w-4 text-zinc-400" /> View Detail
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-zinc-700 font-semibold text-xs focus:bg-zinc-50 focus:text-zinc-900 transition-colors"
          >
            <Link href={`/sales/${item.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit Sales
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-zinc-100 my-1" />

          <DropdownMenuItem
            onClick={() => onDelete(item.id, item.invoice_number)}
            className="cursor-pointer py-2 px-2.5 rounded-xl text-rose-600 font-bold text-xs focus:text-rose-700 focus:bg-rose-50 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4 text-rose-500" /> Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
