"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { SupplierService } from "@/services/supplierService";
import { Supplier } from "@/types/supplier";
import { toast } from "sonner";
import axios from "axios";
import { formatDate, formatRupiah } from "@/utils/helper";
import {
  ArrowLeft,
  Clock,
  FilePen,
  FileText,
  DollarSign,
  Calendar,
  Phone,
  MapPin,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import StatsCard from "@/components/ui/card/StatsCard";
import { SupplierPaymentForm } from "@/components/ui/form/SupplierPaymentForm";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import DSHeader from "./_components/DSHeader";
import DSInformation from "./_components/DSInformation";
import DSStats from "./_components/DSStats";

const emptySubscribe = () => () => {};
export default function SupplierDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const loadData = async () => {
    if (!id || id === "undefined") return;
    try {
      setLoading(true);
      const data = await SupplierService.getSupplier(id);
      setSupplier(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to load supplier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSupplier = async () => {
      setIsMounted(true);
      if (!id || id === "undefined") return;
      try {
        setLoading(true);
        const data = await SupplierService.getSupplier(id);
        setSupplier(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load supplier");
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    loadData();
  };
  const totalUnpaidCount =
    supplier?.purchases?.filter((p) => p.status === "unpaid").length || 0;
  const latestPayment =
    supplier?.supplier_payments && supplier?.supplier_payments.length > 0
      ? supplier.supplier_payments[supplier.supplier_payments.length - 1]
      : null;
  const totalRemainingBill = supplier?.remaining_bill || 0;

  const getRecentPurchase = supplier?.purchases
    ? supplier.purchases
        .filter((p) => p.status === "unpaid")
        .slice(-5)
        .reverse()
    : [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <DSHeader
        supplierId={supplier?.id || 0}
        supplier={supplier}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
        isPaymentModalOpen={isPaymentModalOpen}
        onSuccess={handlePaymentSuccess}
      />

      <DSInformation supplier={supplier} remainingBill={totalRemainingBill} />
      <DSStats
        totalUnpaidCount={totalUnpaidCount}
        latestPayment={isClient ? latestPayment?.amount || 0 : 0}
        remainingBill={isClient ? totalRemainingBill : 0}
      />

      <div className="bg-snow-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mt-2">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-primary" />
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-dark">
            Recent Unpaid purchases
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-primary-brand">
              <tr className=" text-ghost-white text-xs font-black uppercase tracking-widest">
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Remaining Bill</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-400 font-medium animate-pulse"
                  >
                    Loading purchases...
                  </td>
                </tr>
              ) : getRecentPurchase.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-400 font-medium"
                  >
                    No unpaid purchases found.
                  </td>
                </tr>
              ) : (
                getRecentPurchase.map((purchase, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={purchase.id || index}
                      className={`transition-colors duration-200 hover:bg-brand-primary/20 text-brand-dark font-medium ${
                        isEven ? "bg-background/40" : "bg-snow-white"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold tracking-wide">
                        <Link
                          href={`/purchases/${purchase.id}`}
                          className="cursor-pointer hover:underline hover:text-primary-brand hover:scale-105"
                        >
                          {" "}
                          {purchase.invoice_number ||
                            `#${purchase.id?.toString().slice(0, 8)}`}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(purchase.transaction_date)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {formatRupiah(purchase.total_amount || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-amber-600 font-bold">
                        {formatRupiah(purchase.remaining_bill || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
