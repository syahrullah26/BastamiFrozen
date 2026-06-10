"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { SupplierPayment } from "@/types/payment";
import { formatRupiah, formatDate, formatTimeOnly } from "@/utils/helper";
import {
  ArrowLeft,
  FilePen,
  Calendar,
  User,
  FileText,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Receipt,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import HeaderSupplierPayment from "./_components/HeaderSupplierPaymentDetail";
import BasicInfoSupplier from "./_components/BasicInfoSupplierPayment";
import RemainingBillSupplierPayment from "./_components/RemainingBillSupplierPayment";
import LogsSupplierPayment from "./_components/LogsSupplierPayment";
import MapsSupplierPaymentProps from "./_components/MapsSupplierPayment";
import AuditFilesSupplierPayment from "./_components/AuditFilesSupplierPayment";

export default function SupplierPaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [payment, setPayment] = useState<SupplierPayment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const data = await PaymentService.getSupplierPayment(Number(id));
        setPayment(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        } else {
          toast.error("Failed to load payment data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col h-[40vh] items-center justify-center gap-2">
        <p className="text-sm font-medium text-zinc-500">
          Supplier Payment data not found.
        </p>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-primary-brand flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>
    );
  }
  const isCompleted = payment.supplier?.remaining_bill === 0;
  const totalOrderEstimate =
    payment.amount + (payment.supplier?.remaining_bill || 0);
  const paymentPercentage =
    totalOrderEstimate > 0
      ? Math.round((payment.amount / totalOrderEstimate) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2">
      <HeaderSupplierPayment payment={payment} isCompleted={isCompleted} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BasicInfoSupplier payment={payment} />
          <LogsSupplierPayment payment={payment} />
        </div>

        <div className="space-y-6">
          <RemainingBillSupplierPayment
            payment={payment}
            paymentPercentage={paymentPercentage}
            totalOrderEstimate={totalOrderEstimate}
          />
          <MapsSupplierPaymentProps payment={payment} />
          <AuditFilesSupplierPayment id={payment?.supplier?.id} />
        </div>
      </div>
    </div>
  );
}
