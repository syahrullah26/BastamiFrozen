import { CustomerPayment, SupplierPayment } from "@/types/payment";
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

export const CustomerPaymentColumns = (
  onDelete: (id: number, name: string) => void,
) => [
  {
    header: "Date",
    accessor: (item: CustomerPayment) => (
      <span className="text-md font-semibold text-brand-dark">
        {formatDate(item.payment_date)}
      </span>
    ),
  },
  {
    header: "Customer",
    accessor: (item: CustomerPayment) => (
      <div className="flex flex-col gap-0.5 py-1 min-w-50">
        <Link
          href={`/customers/${item.customer.id}`}
          className="text-xs font-bold uppercase tracking-wider text-brand-dark font-mono"
        >
          {item.customer?.name || "No Customer"}
        </Link>
        <div className="grid grid-cols-2 gap-0.5">
          <span className="text-[11px] font-medium text-zinc-400 line-clamp-1 max-w-45">
            {item.customer?.phone || "-"}
          </span>
          <span className="text-[11px] font-medium text-zinc-400 line-clamp-1 max-w-45">
            {item.customer?.location || "-"}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: "Amount",
    accessor: (item: CustomerPayment) => (
      <span className="space-y-2 p-2 rounded-full bg-primary-brand/10 text-primary-brand">
        {formatRupiah(item.amount)}
      </span>
    ),
  },
  {
    header: "Notes",
    accessor: (item: CustomerPayment) => (
      <span className="text-xs font-medium text-zinc-600 line-clamp-2 max-w-45">
        {item.notes || "-"}
      </span>
    ),
  },
  {
    header: "Actions",
    accessor: (item: CustomerPayment) => (
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
            <Link href={`/payments/customer/${item.id}`}>
              <FileText className="mr-2 h-4 w-4 text-zinc-400" /> View Detail
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-zinc-700 font-semibold text-xs focus:bg-zinc-50 focus:text-zinc-900 transition-colors"
          >
            <Link href={`/payments/customer/${item.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit Payment
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-zinc-100 my-1" />

          <DropdownMenuItem
            onClick={() => onDelete(item.id, item.customer?.name || "")}
            className="cursor-pointer py-2 px-2.5 rounded-xl text-rose-600 font-bold text-xs focus:text-rose-700 focus:bg-rose-50 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4 text-rose-500" /> Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const SupplierPaymentColumns = (
  onDelete: (id: number, name: string) => void,
) => [
  {
    header: "Date",
    accessor: (item: SupplierPayment) => (
      <span className="text-md font-semibold text-brand-dark">
        {formatDate(item.payment_date)}
      </span>
    ),
  },
  {
    header: "Customer",
    accessor: (item: SupplierPayment) => (
      <div className="flex flex-col gap-0.5 py-1 min-w-50">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-dark font-mono">
          {item.supplier?.name || "No Customer"}
        </span>
        <div className="grid grid-cols-2 gap-0.5">
          <span className="text-[11px] font-medium text-zinc-400 line-clamp-1 max-w-45">
            {item.supplier?.information.phone || "-"}
          </span>
          <span className="text-[11px] font-medium text-zinc-400 line-clamp-1 max-w-45">
            {item.supplier?.information.address || "-"}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: "Amount",
    accessor: (item: SupplierPayment) => (
      <span className="space-y-2 p-2 rounded-full bg-primary-brand/10 text-primary-brand">
        {formatRupiah(item.amount)}
      </span>
    ),
  },
  {
    header: "Notes",
    accessor: (item: SupplierPayment) => (
      <span className="text-xs font-medium text-zinc-600 line-clamp-2 max-w-45">
        {item.notes || "-"}
      </span>
    ),
  },
  {
    header: "Actions",
    accessor: (item: SupplierPayment) => (
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
            <Link href={`/payments/supplier/${item.id}`}>
              <FileText className="mr-2 h-4 w-4 text-zinc-400" /> View Detail
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-zinc-700 font-semibold text-xs focus:bg-zinc-50 focus:text-zinc-900 transition-colors"
          >
            <Link href={`/payments/supplier/${item.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit Payment
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-zinc-100 my-1" />

          <DropdownMenuItem
            onClick={() => onDelete(item.id, item.supplier?.name || "")}
            className="cursor-pointer py-2 px-2.5 rounded-xl text-rose-600 font-bold text-xs focus:text-rose-700 focus:bg-rose-50 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4 text-rose-500" /> Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
