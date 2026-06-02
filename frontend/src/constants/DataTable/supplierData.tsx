/* eslint-disable @typescript-eslint/no-explicit-any */
import { Supplier } from "@/types/supplier";
import { formatRupiah } from "@/utils/helper";
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

export const SupplierColumns = (
  onDelete: (id: number, name: string) => void,
) => [
  {
    header: "Supplier Name",
    accessor: (item: Supplier) => (
      <div className="flex flex-col gap-0.5 max-w-50">
        <span className="text-xs font-bold text-zinc-800 wrap-break-word line-clamp-1">
          {item.name}
        </span>
        <span className="text-[11px] font-medium text-zinc-400 font-mono">
          {item.information?.phone || "-"}
        </span>
      </div>
    ),
  },
  {
    header: "Location",
    accessor: (item: Supplier) => (
      <span className="text-xs font-medium text-zinc-600 line-clamp-2 max-w-45">
        {item.information?.address || "-"}
      </span>
    ),
  },
  {
    header: "Unpaid Invoice",
    accessor: (item: Supplier) => {
      const purchasesData = item.purchases || [];
      const unpaidCount = purchasesData.filter(
        (purchase: any) => purchase.status?.toLowerCase() === "unpaid",
      ).length;

      if (unpaidCount === 0) {
        return <span className="text-xs font-medium text-zinc-400">-</span>;
      }

      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md font-mono text-[11px] font-bold">
          {unpaidCount} Invoices
        </span>
      );
    },
  },
  {
    header: "Remaining Bill",
    accessor: (item: Supplier) => {
      const billAmount = Number(item.remaining_bill || 0);

      if (billAmount === 0) {
        return (
          <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-500 text-[11px] font-medium rounded-full border border-zinc-200/40">
            Clear
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2.5 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full border border-rose-100 font-mono">
          {formatRupiah(billAmount)}
        </span>
      );
    },
  },
  {
    header: "Actions",
    accessor: (item: Supplier) => (
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
            <Link href={`/suppliers/${item.id}`}>
              <FileText className="mr-2 h-4 w-4 text-zinc-400" /> View Detail
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-zinc-700 font-semibold text-xs focus:bg-zinc-50 focus:text-zinc-900 transition-colors"
          >
            <Link href={`/suppliers/${item.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit Supplier
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-zinc-100 my-1" />

          <DropdownMenuItem
            onClick={() => onDelete(item.id, item.name)}
            className="cursor-pointer py-2 px-2.5 rounded-xl text-rose-600 font-bold text-xs focus:text-rose-700 focus:bg-rose-50 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4 text-rose-500" /> Delete Supplier
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
