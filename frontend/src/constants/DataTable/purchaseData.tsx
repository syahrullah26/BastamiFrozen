/* eslint-disable @typescript-eslint/no-explicit-any */
import { Purchase } from "@/types/purchase";

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

export const PurchaseColumns = (
  onDelete: (id: number, name: string) => void,
) => [
  {
    header: "Invoice Number",
    accessor: (item: Purchase) => (
      <div className="flex flex-col gap-1 py-1.5 min-w-50">
        <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
          {item.supplier?.name || "No Supplier"}
        </span>
        <Link
          href={`/purchases/${item.id}`}
          className="text-[11px] font-medium text-muted-foreground hover:text-primary-brand hover:underline hover:scale-105 cursor-pointer"
        >
          {item.invoice_number}
        </Link>
      </div>
    ),
  },
  {
    header: "Date",
    accessor: (item: Purchase) => (
      <span className="text-xs font-semibold text-brand-dark">
        {formatDate(item.transaction_date)}
      </span>
    ),
  },
  {
    header: "Items",
    accessor: (item: Purchase) => (
      <div className="flex flex-col gap-3.5 max-h-56 overflow-y-auto py-1.5 min-w-60 scrollbar-thin">
        {item.items && item.items.length > 0 ? (
          item.items.map((p) => {
            const isDepleted =
              p.remaining_qty === 0 || p.batch_status === "depleted";
            const baseUnit = p.product?.units?.find((u: any) => {
              return (
                parseFloat(u.conversion_factor) === 1 ||
                parseInt(u.conversion_factor, 10) === 1
              );
            });
            const smallestUnitName = baseUnit?.unit_name || p.product_unit_name;

            return (
              <div
                key={p.id}
                className="group flex flex-col gap-2 border-b border-zinc-100 pb-3.5 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-800 wrap-break-word line-clamp-2 max-w-[65%]">
                    {p.product?.name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 font-mono text-[10px] font-bold text-zinc-600 rounded-md border border-zinc-200/40 shrink-0">
                    <span>x{p.quantity}</span>
                    <span className="font-sans text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">
                      {p.product_unit_name}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col gap-2 bg-zinc-50/60 p-2.5 rounded-xl border border-zinc-200/50">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Price</span>
                    <span className="font-medium text-zinc-700">
                      {formatRupiah(Number(p.price))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-zinc-200/40 font-medium">
                    <span className="text-zinc-400">Subtotal</span>
                    <span className="font-mono font-bold text-brand-dark">
                      {formatRupiah(Number(p.subtotal))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Remaining</span>
                    <span className="font-mono font-semibold text-zinc-700">
                      {p.remaining_qty ?? 0} {smallestUnitName}
                    </span>
                  </div>

                  {p.batch_status && (
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-zinc-200/30">
                      <span className="text-zinc-400">Batch Status</span>
                      <span
                        className={`px-1.5 py-0.5 font-sans font-bold uppercase tracking-wider rounded-md text-[9px] ${
                          isDepleted
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}
                      >
                        {p.batch_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
            <span className="text-[11px] italic text-zinc-400">
              No items listed
            </span>
          </div>
        )}
      </div>
    ),
  },
  {
    header: "Total Amount",
    accessor: (item: Purchase) => (
      <span className="text-xs font-bold text-brand-dark bg-brand-dark/5 px-3 py-1.5 rounded-full">
        {formatRupiah(Number(item.total_amount))}
      </span>
    ),
  },
  {
    header: "Remaining Bill",
    accessor: (item: Purchase) => {
      const bill = Number(item.remaining_bill);
      return (
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            bill > 0
              ? "bg-orange-400/10 text-orange-500"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {formatRupiah(bill)}
        </span>
      );
    },
  },
  {
    header: "Status",
    accessor: (item: Purchase) => {
      const isPaid = item.status === "paid";
      return (
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
            isPaid
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : "bg-red-400/10 text-red-500 border border-red-400/20"
          }`}
        >
          {item.status}
        </span>
      );
    },
  },
  {
    header: "Actions",
    accessor: (item: Purchase) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-200 shadow-3xs transition-all cursor-pointer">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 rounded-2xl shadow-xl border-slate-100 p-1.5 bg-white"
        >
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">
            Options Management
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 my-1" />

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:bg-slate-50 transition-colors"
          >
            <Link href={`/purchases/${item.id}`}>
              <FileText className="mr-2 h-4 w-4 text-slate-400" /> View Detail
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:bg-slate-50 transition-colors"
          >
            <Link href={`/purchases/${item.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4 text-slate-400" /> Edit purchases
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-100 my-1" />

          <DropdownMenuItem
            onClick={() => onDelete(item.id, item.invoice_number)}
            className="cursor-pointer py-2 px-2.5 rounded-xl text-red-600 font-bold text-xs focus:text-red-700 focus:bg-red-50/70 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
