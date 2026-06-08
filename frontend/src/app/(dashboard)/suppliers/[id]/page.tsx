"use client";

import React, { useState, useEffect } from "react";
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

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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

  const formattedRemainingBill = isMounted
    ? formatRupiah(totalRemainingBill)
    : "Rp 0";
  const formattedLatestPayment = isMounted
    ? formatRupiah(latestPayment?.amount || 0)
    : "Rp 0";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="w-full border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-none">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors group"
            >
              <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] pl-1 hidden xs:inline">
                Back
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-none">
            <ButtonNav
              href={`/suppliers/${supplier?.id}/edit`}
              className="px-3 py-2 text-xs sm:text-sm font-medium"
              icon={<FilePen className="w-3.5 h-3.5" />}
            >
              Edit
            </ButtonNav>
            <ButtonNav
              onClick={() => setIsPaymentModalOpen(true)}
              icon={<DollarSign className="w-4 h-4" />}
              iconPosition="left"
              variant="secondary"
              fullWidth={false}
            >
              Payment
            </ButtonNav>

            <BaseModal
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              title="Pay Supplier Bill"
              size="md"
            >
              <SupplierPaymentForm
                supplierId={Number(id)}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setIsPaymentModalOpen(false)}
              />
            </BaseModal>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-snow-white p-6 rounded-xl border border-foreground/30 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
            Supplier Profile
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark mt-1">
            {supplier?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <span className="inline-block ">
              <MapPin className="w-4 h-4 text-tertiary-brand" />
            </span>
            Location: {supplier?.information.address || "No Location Listed"}
          </p>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <span className="inline-block  ">
              <Phone className="w-4 h-4 text-emerald-500" />
            </span>
            {supplier?.information.phone || "No Phone Number Listed"}
          </p>
        </div>
        <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
            Total Remaining Bill
          </span>
          <span className="text-2xl font-black text-brand-dark block mt-1">
            {formattedRemainingBill}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          title="Total Unpaid"
          value={totalUnpaidCount}
          icon={<FileText className="w-4 h-4" />}
          iconBgColor="bg-orange-400/10"
          iconColor="text-orange-400"
        />
        <StatsCard
          title="Latest Payment"
          value={formattedLatestPayment}
          icon={<DollarSign className="w-4 h-4" />}
          iconBgColor="bg-emerald-400/10"
          iconColor="text-emerald-400"
        />
        <StatsCard
          title="Total Remaining Bill"
          value={formattedRemainingBill}
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-red-400/10"
          iconColor="text-red-400"
        />
      </div>
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
