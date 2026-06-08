import React from "react";
import { Sale } from "@/types/sale";
import { formatRupiah, formatDate } from "@/utils/helper";

interface FakturReceiptProps {
  data: Sale | null;
}

export const FakturReceipt = React.forwardRef<
  HTMLDivElement,
  FakturReceiptProps
>(({ data }, ref) => {
  if (!data) return null;

  return (
    <div
      ref={ref}
      className="hidden print:block font-mono text-[10px] uppercase text-zinc-900 leading-tight bg-white p-4 break-inside-avoid"
      style={{ width: "100%", maxWidth: "210mm" }}
    >
      <div className="grid grid-cols-2 gap-4 items-start border-b border-zinc-200 pb-2.5 mb-2.5">
        <div className="flex items-stretch gap-2.5">
          <div className="w-1 bg-primary-brand rounded-sm"></div>
          <div className="space-y-0.5">
            <h2 className="text-sm font-black tracking-wide text-brand-dark">
              Bastami Frozen Food
            </h2>
            <p className="text-[9px] text-zinc-500 font-medium">
              Penyedia Produk Frozen Food Berkualitas
            </p>
            <p className="text-[9px] text-zinc-500 font-medium">
              Jl. Kp. Karang Kitri No.43-4, RT.005/RW.009, Margahayu, Kec.
              Bekasi Tim., Kota Bks, Jawa Barat 17113
            </p>
            <p className="text-[9px] text-zinc-400">Telp: 0812-3456-7890</p>
          </div>
        </div>

        <div className="text-[9px] justify-self-end w-full max-w-60 space-y-0.5">
          <h1 className="text-xs font-black tracking-widest text-primary-brand mb-1.5 text-right">
            FAKTUR PENJUALAN
          </h1>
          <div className="grid grid-cols-[80px_10px_1fr]">
            <span className="text-zinc-500">NO. NOTA</span>
            <span className="text-zinc-400">:</span>
            <span className="font-bold text-brand-dark text-right">
              {data.invoice_number}
            </span>
          </div>
          <div className="grid grid-cols-[80px_10px_1fr]">
            <span className="text-zinc-500">TANGGAL</span>
            <span className="text-zinc-400">:</span>
            <span className="text-zinc-700 text-right">
              {formatDate(data.transaction_date)}
            </span>
          </div>
          <div className="grid grid-cols-[80px_10px_1fr]">
            <span className="text-zinc-500">PELANGGAN</span>
            <span className="text-zinc-400">:</span>
            <span className="font-bold text-brand-dark text-right truncate">
              {data.customer?.name || data.customer_name}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-b border-zinc-300 py-[1px] my-1">
        <table className="w-full text-left border-collapse text-[9px]">
          <thead>
            <tr className="border-t border-b border-zinc-300 font-bold text-brand-dark bg-zinc-50/40">
              <th className="py-1.5 px-1 w-[6%] text-center">NO</th>
              <th className="py-1.5 px-2 w-[49%]">NAMA BARANG</th>
              <th className="py-1.5 px-2 w-[15%] text-center">QTY</th>
              <th className="py-1.5 px-2 w-[15%] text-right">HARGA</th>
              <th className="py-1.5 px-2 w-[15%] text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.items?.map((item, index) => (
              <tr key={item.id} className="text-zinc-700">
                <td className="py-1.5 px-1 text-center text-zinc-400">
                  {index + 1}
                </td>
                <td className="py-1.5 px-2 font-medium tracking-wide text-zinc-900">
                  {item.product_name || item.product?.name}
                </td>
                <td className="py-1.5 px-2 text-center font-semibold text-brand-dark">
                  {item.quantity} {item.unit || "PCS"}
                </td>
                <td className="py-1.5 px-2 text-right text-zinc-500">
                  {formatRupiah(item.price)}
                </td>
                <td className="py-1.5 px-2 text-right font-bold text-zinc-900">
                  {formatRupiah(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-2 pb-2">
        <div className="text-[9px] self-start pt-0.5">
          <span className="inline-block border border-zinc-200 px-2 py-0.5 font-bold text-zinc-600 bg-zinc-50/20 rounded-sm">
            STATUS: {data.status === "unpaid" ? "BELUM LUNAS" : "LUNAS"}
          </span>
        </div>

        <div className="space-y-1 text-[9px] font-medium">
          <div className="flex justify-between text-zinc-500">
            <span>TOTAL MACAM BARANG:</span>
            <span className="font-bold text-zinc-700">
              {data.items?.length || 0} ITEMS
            </span>
          </div>
          <div className="border-t border-zinc-300 py-[1px]">
            <div className="flex justify-between text-brand-dark font-bold border-t border-zinc-300 pt-1 text-xs">
              <span>TOTAL BELANJA:</span>
              <span className="text-primary-brand">
                {formatRupiah(data.amount?.total_amount)}
              </span>
            </div>
          </div>
          {data.status === "unpaid" && (
            <div className="flex justify-between text-zinc-600 font-bold border-t border-dashed border-zinc-200 pt-0.5">
              <span>SISA TAGIHAN:</span>
              <span className="text-brand-dark">
                {formatRupiah(data.amount?.remaining_bill)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 text-center text-[9px] mt-4 pt-3 border-t border-zinc-200">
        <div className="flex flex-col items-center space-y-1">
          <p className="text-zinc-500 font-medium">Dibuat Oleh,</p>
          <div className="h-10"></div>
          <p className="text-zinc-400 tracking-tighter">
            .........................
          </p>
          <p className="font-bold text-zinc-700 uppercase">( KASIR / ADMIN )</p>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <p className="text-zinc-500 font-medium">Penerima,</p>
          <div className="h-10"></div>
          <p className="text-zinc-400 tracking-tighter">
            .........................
          </p>
          <p className="font-bold text-zinc-700 uppercase">( PELANGGAN )</p>
        </div>
      </div>
    </div>
  );
});

FakturReceipt.displayName = "FakturReceipt";
