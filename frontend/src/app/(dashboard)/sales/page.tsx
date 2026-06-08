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
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Sales
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your customer bills and sales
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ButtonNav
            onClick={handleOpenModal}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
          >
            Add Sales
          </ButtonNav>
          <ButtonNav
            onClick={handleOpenPaymentModal}
            icon={<DollarSignIcon className="w-4 h-4" />}
            iconPosition="left"
            variant="secondary"
            fullWidth={false}
          >
            Payment
          </ButtonNav>
        </div>
        <BaseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Add Sales"
          size="lg"
        >
          <SaleForm onSucces={handleSuccess} onCancel={handleCloseModal} />
        </BaseModal>
        <BaseModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          title="Add Customer Payment"
          size="md"
        >
          <CustomerPaymentForm
            onSuccess={handleSuccess}
            onCancel={handleClosePaymentModal}
          />
        </BaseModal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <StatsCard
          title="Sales This Month"
          value={saleStats.total_monthly_sale}
          icon={<Receipt className="w-6 h-6" />}
          iconBgColor="bg-rose-500/10"
          iconColor="text-rose-500"
        />
        <StatsCard
          title="Sales Pending"
          value={saleStats.total_pending_sale}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-amber-500/10"
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Sales Paid This Month"
          value={saleStats.total_monthly_paid_sale}
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <StatsCard
          title="Remaining Bills"
          value={
            isClient ? formatRupiah(saleStats.total_remaining_bill) : "Rp 0"
          }
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-primary-brand/10"
          iconColor="text-primary-brand"
        />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto flex-1 xl:flex-initial">
            <div className="flex items-center gap-2">
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-zinc-600 bg-white hover:bg-zinc-50 active:scale-98 rounded-xl transition-all border border-zinc-200 shadow-2xs cursor-pointer group/btn">
                <Filter className="w-4 h-4 text-zinc-400 group-hover/btn:text-zinc-600 transition-colors" />
                <span>Filter</span>
              </button>

              <SyncHppButton onSuccess={handleSuccess} />
            </div>

            <div className="hidden sm:block h-5 w-px bg-zinc-200/80 mx-1" />

            <div className="flex items-center gap-2 bg-zinc-50/50 border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs focus-within:bg-white focus-within:border-brand-dark focus-within:ring-4 focus-within:ring-brand-dark/5 transition-all duration-200 flex-1 sm:flex-initial">
              <div className="flex items-center gap-2 text-zinc-400 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Period:
                </span>
              </div>

              <div className="flex items-center gap-1 w-full">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs text-zinc-700 font-medium focus:outline-none cursor-pointer w-full scheme-light"
                />

                <span className="text-zinc-400 text-xs px-0.5">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs text-zinc-700 font-medium focus:outline-none cursor-pointer w-full scheme-light"
                />

                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 ml-1 px-1.5 py-0.5 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full sm:max-w-xs xl:max-w-sm flex-1 xl:flex-initial">
            <div className="group relative flex items-center bg-zinc-50/50 hover:bg-white border border-zinc-200 rounded-xl px-3.5 shadow-2xs focus-within:bg-white focus-within:border-brand-dark focus-within:ring-4 focus-within:ring-brand-dark/5 transition-all duration-200 w-full">
              <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-brand-dark transition-colors shrink-0" />
              <input
                type="text"
                placeholder="Search sales..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-2.5 pr-1 py-2.5 bg-transparent text-xs text-zinc-800 placeholder-zinc-400 font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSale}
        isLoading={isDeleting}
        title="Delete Sales"
        message={`Are you sure you want to delete ${selectedSale?.name}?`}
        type="delete"
      />

      <div className="flex md:flex-row flex-col gap-4 md:justify-between justify-center items-center md:items-start">
        <span className="text-xl font-bold text-brand-dark md:text-2xl mt-3.5 ml-3.5">
          Your Sales List ({activeTab})
        </span>
        <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-xl w-full lg:w-fit overflow-x-auto no-scrollbar">
          {FILTER_TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 lg:flex-initial text-center px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-brand-dark shadow-xs border border-zinc-200/50"
                    : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

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
