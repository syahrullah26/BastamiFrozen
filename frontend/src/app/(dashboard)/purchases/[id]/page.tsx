"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PurchaseService } from "@/services/purchaseService";
import { Purchase } from "@/types/purchase";
import { toast } from "sonner";
import axios from "axios";
import HeaderPurchaseDetail from "./_components/HeaderPurchaseDetail";
import GlobalLoader from "@/components/ui/common/GlobalLoading";
import StatsPurchaseDetail from "./_components/StatsPurchaseDetail";
import TablePurchaseDetail from "./_components/TablePurchaseDetail";

export default function PurchaseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchPurchase = async () => {
      try {
        setLoading(true);
        const data = await PurchaseService.getPurchase(id);
        setPurchase(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load purchase");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);
  const loadData = async () => {
    if (!id || id === "undefined") return;
    try {
      setLoading(true);
      const data = await PurchaseService.getPurchase(id);
      setPurchase(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to load purchase");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsModalPaymentOpen(false);
    loadData();
  };
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <GlobalLoader />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <HeaderPurchaseDetail
        purchase={purchase}
        isModalPaymentOpen={isModalPaymentOpen}
        setIsModalPaymentOpen={setIsModalPaymentOpen}
        handlePaymentSuccess={handlePaymentSuccess}
        handlePaymentCancel={() => setIsModalPaymentOpen(false)}
      />
      <StatsPurchaseDetail purchase={purchase} />
      <TablePurchaseDetail purchase={purchase} />
    </div>
  );
}
