"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
  useRef,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import { SaleService } from "@/services/saleService";
import { Sale, SaleStats, StatusFilter } from "@/types/sale";
import ButtonNav from "@/components/ui/button/ButtonNav";
import {
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  Receipt,
  DollarSign,
  DollarSignIcon,
} from "lucide-react";
import TableData from "@/components/ui/Table/TableData";
import StatsCard from "@/components/ui/card/StatsCard";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { formatRupiah } from "@/utils/helper";
import { SaleColumns } from "@/constants/DataTable/saleData";
import { SaleForm } from "@/components/ui/form/SaleForm";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import SyncHppButton from "@/components/ui/button/SyncHppButton";
import { CustomerPaymentForm } from "@/components/ui/form/CustomerPaymentForm";
import { FakturReceipt } from "@/components/ui/print/faktur/FakturReceipt";
import { useReactToPrint } from "react-to-print";
import { useStatusFilter } from "@/hooks/useStatusFilter";
import { FILTER_TABS_CONFIG } from "@/constants/Filter/StatusFilterConfig";
import HeaderSales from "./_components/HeaderSales";
import StatsCardSales from "./_components/StatsCardSales";
import FilterSales from "../purchases/[id]/_components/FilterSales";
import ActiveTabSales from "./_components/ActiveTabSales";

const emptySubscribe = () => () => {};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const [isPaymentModalOpen, setIsModalPaymentOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { activeTab, setActiveTab } = useStatusFilter({
    data: sales,
    initialStatus: "unpaid",
  });

  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [saleStats, setSaleStats] = useState<SaleStats>({
    total_monthly_sale: 0,
    total_pending_sale: 0,
    total_monthly_paid_sale: 0,
    total_remaining_bill: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<Sale | null>(null);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const loadData = useCallback(
    async (
      pageNumber = 1,
      status: StatusFilter = "unpaid",
      start?: string,
      end?: string,
    ) => {
      try {
        setLoading(true);
        const data = await SaleService.getSales(
          pageNumber,
          status === "all" ? undefined : status,
          start,
          end,
        );

        setSales(data.data.data || []);
        setCurrentPage(data.data.meta.current_page || 1);
        setLastPage(data.data.meta.last_page || 1);
        setTotalItems(data.data.meta.total || 0);

        const metaStats = data.data.meta.stats;
        if (metaStats) {
          setSaleStats({
            total_monthly_sale: metaStats.total_monthly_sale,
            total_pending_sale: metaStats.total_pending_sale,
            total_monthly_paid_sale: metaStats.total_monthly_paid_sale,
            total_remaining_bill: metaStats.total_remaining_bill,
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed Load Sales data");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await loadData(currentPage, activeTab, startDate, endDate);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [loadData, currentPage, activeTab, startDate, endDate]);

  const handleTabChange = (status: StatusFilter) => {
    setActiveTab(status);
    setCurrentPage(1);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenPaymentModal = () => setIsModalPaymentOpen(true);
  const handleClosePaymentModal = () => setIsModalPaymentOpen(false);

  const handleDeleteClick = useCallback((id: number, name: string) => {
    setSelectedSale({ id, name });
    setIsDeleteModalOpen(true);
  }, []);

  const handleTriggerPrintAction = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Faktur-${printData?.invoice_number || "Nota"}`,
  });

  const handlePrintClick = useCallback(
    async (id: number) => {
      const toastId = toast.loading(
        "Mengambil detail transaksi untuk dicetak...",
      );
      try {
        const response = await SaleService.getSale(id);
        setPrintData(response);
        toast.dismiss(toastId);
        setTimeout(() => {
          handleTriggerPrintAction();
        }, 150);
      } catch (error) {
        console.error(error);
        toast.error("Terjadi kesalahan sistem print", { id: toastId });
      }
    },
    [handleTriggerPrintAction],
  );

  const handleSuccess = () => loadData(currentPage, activeTab);

  const handleDeleteSale = async () => {
    if (!selectedSale) return;
    try {
      setIsDeleting(true);
      await SaleService.deleteSale(selectedSale.id);
      toast.success("Purchase Deleted", {
        description: `${selectedSale.name} has been removed.`,
      });
      loadData(currentPage, activeTab);
    } catch (error) {
      toast.error("Failed to delete sale :" + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = useMemo(() => {
    return sales.filter((sale) => {
      const invoiceNumber = (sale.invoice_number || "")
        .toLowerCase()
        .includes(search.toLocaleLowerCase());
      const customerName = (sale.customer?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const productName = (sale.items || []).some((item) => {
        return (item.product?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase());
      });
      return invoiceNumber || customerName || productName;
    });
  }, [sales, search]);

  const columns = useMemo(
    () => SaleColumns(handleDeleteClick, handlePrintClick),
    [handleDeleteClick, handlePrintClick],
  );

  return (
    <div className="space-y-6">
      <HeaderSales
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isPaymentModalOpen={isPaymentModalOpen}
        setIsPaymentModalOpen={setIsModalPaymentOpen}
        handleOpenModal={handleOpenModal}
        handleOpenPaymentModal={handleOpenPaymentModal}
        onSuccess={handleSuccess}
      />

      <StatsCardSales saleStats={saleStats} />

      <FilterSales
        search={search}
        setSearch={setSearch}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        handleSuccess={handleSuccess}
        onFilterClick={loadData}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSale}
        isLoading={isDeleting}
        title="Delete Sales"
        message={`Are you sure you want to delete ${selectedSale?.name}?`}
        type="delete"
      />

      <ActiveTabSales
        activeTab={activeTab}
        handleTabChange={(id) => setActiveTab(id)}
        filterTabsConfig={FILTER_TABS_CONFIG}
      />

      <div className="w-full overflow-auto">
        <TableData
          columns={columns}
          data={filteredData}
          loading={loading}
          pagination={{
            currentPage: currentPage,
            lastPage: lastPage,
            totalItems: totalItems,
            onPageChange: (newPage) => setCurrentPage(newPage),
          }}
        />
      </div>
      <FakturReceipt ref={printRef} data={printData} />
    </div>
  );
}
