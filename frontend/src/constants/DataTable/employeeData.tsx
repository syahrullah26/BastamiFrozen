import { Employee } from "@/types/employee";
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

export const EmployeeColumns = (
  onDelete: (id: number, name: string) => void,
) => [
  {
    header: "ID",
    accessor: (item: Employee) => (
      <span className="text-md font-semibold text-brand-dark">{item.id}</span>
    ),
  },
  {
    header: "Employee Name",
    accessor: (item: Employee) => (
      <span className="text-md font-semibold text-brand-dark">{item.name}</span>
    ),
  },
  {
    header: "Salary",
    accessor: (item: Employee) => (
      <span className="text-md font-semibold space-y-2 p-2 rounded-full bg-primary-brand/10 text-primary-brand">
        {formatRupiah(item.salary)}
      </span>
    ),
  },
  {
    header: "Status",
    accessor: (item: Employee) => (
      <span
        className={`text-md font semibold space-y-2 p-2 rounded-full ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-400/10 text-red-400"} `}
      >
        {item.status}
      </span>
    ),
  },
  {
    header: "Actions",
    accessor: (item: Employee) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-200 shadow-3xs transition-all cursor-pointer">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 rounded-2xl shadow-xl border-slate-100 p-1.5"
        >
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">
            Options Management
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 my-1" />
          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:bg-slate-50 transition-colors"
          >
            <Link href={`/employees/${item.id}`}>
              <FileText className="mr-2 h-4 w-4 text-slate-400" /> View Detail
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:bg-slate-50 transition-colors"
          >
            <Link href={`/employee/${item.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4 text-slate-400" /> Edit Product
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-100 my-1" />
          <DropdownMenuItem
            onClick={() => onDelete(item.id, item.name)}
            className="cursor-pointer py-2 px-2.5 rounded-xl text-red-600 font-bold text-xs focus:text-red-700 focus:bg-red-50/70 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
