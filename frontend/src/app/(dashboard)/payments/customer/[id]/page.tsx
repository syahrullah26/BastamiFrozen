"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { CustomerPayment } from "@/types/payment";
import { ArrowLeft } from "lucide-react";
import HeaderCustomerPayment from "./_components/HeaderCustomerPayment";
import BasicInfoCustomer from "./_components/BasicInfoCustomerPayment";
import LogsCustomerPayment from "./_components/LogsCustomerPayment";
import RemainingBillCustomerPayment from "./_components/RemainingBillCustomerPayment";
import MapsCustomerPaymentProps from "./_components/MapsCustomerPayment";
import AuditFilesCustomerPayment from "./_components/AuditFilesSupplierPayment";

export default function CustomerPaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [payment, setPayment] = useState<CustomerPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const data = await PaymentService.getCustomerPayment(Number(id));
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

  const handleSuccessRemainingPayment = () => {
    setIsModalOpen(false);
    router.push(`/customers/${payment?.customer?.id}`);
  };
  const handleCloseModal = () => setIsModalOpen(false);

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
          Customer Payment data not found.
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

  const isCompleted = payment.customer?.remaining_bill === 0;
  const totalOrderEstimate =
    payment.amount + (payment.customer?.remaining_bill || 0);
  const paymentPercentage =
    totalOrderEstimate > 0
      ? Math.round((payment.amount / totalOrderEstimate) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2">
      <HeaderCustomerPayment payment={payment} isCompleted={isCompleted} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BasicInfoCustomer payment={payment} />
          <LogsCustomerPayment payment={payment} />
        </div>

        <div className="space-y-6">
          <RemainingBillCustomerPayment
            payment={payment}
            paymentPercentage={paymentPercentage}
            totalOrderEstimate={totalOrderEstimate}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onSuccess={handleSuccessRemainingPayment}
            onCancel={handleCloseModal}
          />
          <MapsCustomerPaymentProps payment={payment} />
          <AuditFilesCustomerPayment id={payment.customer?.id} />
        </div>
      </div>
    </div>
  );
}
