"use client";
import React, {
  useState,
  useEffect,
  useSyncExternalStore,
  useRef,
} from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { formatDate, formatRupiah } from "@/utils/helper";
import { SaleService } from "@/services/saleService";
import { Sale } from "@/types/sale";
import { useReactToPrint } from "react-to-print";
import { FakturReceipt } from "@/components/ui/print/faktur/FakturReceipt";

import {
  ArrowLeft,
  FilePen,
  Calendar,
  BoxIcon,
  Printer,
  DollarSignIcon,
  Phone,
  User,
  ShoppingBag,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import GlobalLoader from "@/components/ui/common/GlobalLoading";
import HeaderSalesDetail from "./_components/HeaderSalesDetail";
import StatsCardSalesDetail from "./_components/StatsCardSalesDetail";
import TableSaleDetail from "./_components/TableSalesDetail";

const emptySubscribe = () => () => {};

export default function SaleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const componentRef = useRef<HTMLDivElement>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

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
      <HeaderSalesDetail sale={sale} handlePrint={handlePrint} />
      <StatsCardSalesDetail sale={sale} />

      <TableSaleDetail sale={sale} />
      <FakturReceipt ref={componentRef} data={sale} />
    </div>
  );
}
