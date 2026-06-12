"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { SaleService } from "@/services/saleService";
import { Sale } from "@/types/sale";
import { useReactToPrint } from "react-to-print";
import { FakturReceipt } from "@/components/ui/print/faktur/FakturReceipt";

import GlobalLoader from "@/components/ui/common/GlobalLoading";
import HeaderSalesDetail from "./_components/HeaderSalesDetail";
import StatsCardSalesDetail from "./_components/StatsCardSalesDetail";
import TableSaleDetail from "./_components/TableSalesDetail";

export default function SaleDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const componentRef = useRef<HTMLDivElement>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchSale = async () => {
      try {
        setLoading(true);
        const data = await SaleService.getSale(id);
        setSale(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load sale");
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id]);

  const loadData = async () => {
    if (!id || id === "undefined") return;
    try {
      setLoading(true);
      const data = await SaleService.getSale(id);
      setSale(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to load sale");
    } finally {
      setLoading(false);
    }
  };
  const handlePaymentSucces = () => {
    setIsModalPaymentOpen(false);
    loadData();
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Faktur-${sale?.invoice_number || id}`,
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <GlobalLoader message="Loading..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <HeaderSalesDetail
        sale={sale}
        handlePrint={handlePrint}
        isModalPaymentOpen={isModalPaymentOpen}
        setIsModalPaymentOpen={setIsModalPaymentOpen}
        handlePaymentSuccess={handlePaymentSucces}
        handlePaymentCancel={() => setIsModalPaymentOpen(false)}
      />
      <StatsCardSalesDetail sale={sale} />

      <TableSaleDetail sale={sale} />
      <FakturReceipt ref={componentRef} data={sale} />
    </div>
  );
}
