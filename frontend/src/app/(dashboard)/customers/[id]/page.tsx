"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CustomerService } from "@/services/customerService";
import { Customer } from "@/types/customer";
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
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import StatsCard from "@/components/ui/card/StatsCard";
import { CustomerPaymentForm } from "@/components/ui/form/CustomerPaymentForm";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import DCBack from "../_components/detail/DCBack";
import DCHeader from "../_components/detail/DCHeader";
import DCInformation from "../_components/detail/DCInformation";
import DCUnpaidTable from "../_components/detail/DCUnpaidTable";

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadData = async () => {
    if (!customerId || customerId === "undefined") return;
    try {
      setLoading(true);
      const data = await CustomerService.getCustomer(customerId);
      setCustomer(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to load customer");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId || customerId === "undefined") return;
      try {
        setLoading(true);
        const data = await CustomerService.getCustomer(customerId);
        setCustomer(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load customer");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    loadData();
  };
  const totalUnpaidCount =
    customer?.sale?.filter((sale) => sale.status === "unpaid").length || 0;
  const latestPayment =
    customer?.customer_payment && customer.customer_payment.length > 0
      ? customer.customer_payment[customer.customer_payment.length - 1]
      : null;
  const totalRemainingBill = customer?.remaining_bill || 0;

  const getRecentSale = customer?.sale
    ? customer.sale
        .filter((sale) => sale.status === "unpaid")
        .slice(-5)
        .reverse()
    : [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <DCHeader
        isPaymentModalOpen={isPaymentModalOpen}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
        customer={customer}
        customerId={Number(customerId) || 0}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setIsPaymentModalOpen(false)}
      />

      <DCInformation
        customer={customer}
        totalRemainingBill={totalRemainingBill}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          title="Total Unpaid"
          value={totalUnpaidCount}
          icon={<FileText className="w-4 h-4" />}
          iconBgColor="bg-orange-400/10"
          iconColor="text-orange-400"
        />
        <StatsCard
          title="Latest Payment"
          value={formatRupiah(latestPayment?.amount || 0)}
          icon={<DollarSign className="w-4 h-4" />}
          iconBgColor="bg-emerald-400/10"
          iconColor="text-emerald-400"
        />
        <StatsCard
          title="Total Remaining Bill"
          value={formatRupiah(totalRemainingBill || 0)}
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-red-400/10"
          iconColor="text-red-400"
        />
      </div>
      <DCUnpaidTable recentSale={getRecentSale} loading={loading} />
    </div>
  );
}
