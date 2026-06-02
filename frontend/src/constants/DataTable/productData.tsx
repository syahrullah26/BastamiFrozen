import { Product } from "@/types/product";
import Image from "next/image";
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

export const ProductColumns = (
  onDelete: (id: number, name: string) => void,
) => [
  {
    header: "Product Detail",
    accessor: (item: Product) => {
      const imageSrc = item.image
        ? `http://127.0.0.1:8000/storage/${item.image}`
        : "/images/image-placeholder.png";

      return (
        <div className="flex flex-row items-center justify-start gap-4 py-1.5 group/prod-cell select-none">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50 shrink-0 shadow-xs ring-4 ring-slate-50 group-hover/prod-cell:scale-105 group-hover/prod-cell:shadow-md group-hover/prod-cell:ring-slate-100/80 transition-all duration-300 ease-out">
            <Image
              src={imageSrc}
              alt={item.name}
              fill
              sizes="64px"
              className="object-cover object-center transition-transform duration-500 group-hover/prod-cell:scale-110"
              priority={false}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-black text-slate-900 text-sm tracking-tight leading-snug truncate max-w-50 group-hover/prod-cell:text-brand-dark transition-colors duration-200">
              {item.name}
            </span>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/40">
                #{item.id}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-400 truncate max-w-25">
                Active Product
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    header: "Stock Status",
    accessor: (item: Product) => {
      const smallestUnit =
        item.units && item.units.length > 0
          ? [...item.units].sort(
              (a, b) => a.conversion_factor - b.conversion_factor,
            )[0]
          : null;

      const smallestUnitName = smallestUnit ? smallestUnit.unit_name : "Pcs";

      if (!item.units || item.units.length === 0 || item.stock === 0) {
        return (
          <span className="inline-flex items-center font-bold text-red-500 text-xs bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
            Out of Stock
          </span>
        );
      }

      const sortedUnitsDesc = [...item.units].sort(
        (a, b) => b.conversion_factor - a.conversion_factor,
      );

      let remainingStock = item.stock;
      const stockDisplayParts: string[] = [];

      sortedUnitsDesc.forEach((unit) => {
        const factor = unit.conversion_factor;
        if (remainingStock >= factor && factor > 0) {
          const count = Math.floor(remainingStock / factor);
          remainingStock = remainingStock % factor;
          stockDisplayParts.push(`${count} ${unit.unit_name}`);
        }
      });

      if (remainingStock > 0 || stockDisplayParts.length === 0) {
        stockDisplayParts.push(`${remainingStock} ${smallestUnitName}`);
      }

      return (
        <div className="flex flex-col gap-1.5 justify-center">
          <div className="flex flex-wrap gap-1 max-w-40">
            {stockDisplayParts.map((part, index) => (
              <span
                key={index}
                className="inline-block font-extrabold text-slate-700 text-[11px] bg-slate-100 border border-slate-200/30 px-2.5 py-0.5 rounded-lg shadow-3xs"
              >
                {part}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 pl-0.5">
            Total: <strong className="text-slate-600">{item.stock}</strong>{" "}
            {smallestUnitName}
          </span>
        </div>
      );
    },
  },
  {
    header: "Units & Pricing Tier",
    accessor: (product: Product) => (
      <div className="flex flex-col gap-1.5 min-w-62.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar justify-center">
        {product.units.map((unit, idx) => (
          <div
            key={unit.id || idx}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 border border-slate-100 text-xs hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-slate-800">
                {unit.unit_name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Factor ratio: {unit.conversion_factor}
              </span>
            </div>
            <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/70 shadow-3xs tracking-tight">
              {Number(unit.price).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    header: "Actions",
    accessor: (item: Product) => (
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
            <Link href={`/products/${item.id}`}>
              <FileText className="mr-2 h-4 w-4 text-slate-400" /> View Detail
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="cursor-pointer py-2 px-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:bg-slate-50 transition-colors"
          >
            <Link href={`/products/${item.id}/edit`}>
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
