"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import { PurchaseService } from "@/services/purchaseService";
import { Purchase, PurchaseStats, BatchStatus } from "@/types/purchase";
import { StatusFilter } from "@/types/sale";
import ButtonNav from "@/components/ui/button/ButtonNav";
import {
  Plus,
  Search,
  Clock,
  Calendar,
  Receipt,
  DollarSign,
  DollarSignIcon,
} from "lucide-react";
import TableData from "@/components/ui/Table/TableData";
import StatsCard from "@/components/ui/card/StatsCard";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { PurchaseColumns } from "@/constants/DataTable/purchaseData";
import { formatRupiah } from "@/utils/helper";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { PurchaseForm } from "@/components/ui/form/PurchaseForm";
import { SupplierPaymentForm } from "@/components/ui/form/SupplierPaymentForm";
import { useStatusFilter } from "@/hooks/useStatusFilter";
import { FILTER_TABS_CONFIG } from "@/constants/Filter/StatusFilterConfig";
import { useBatchFilter } from "@/hooks/useBatchFilter";
import { BATCH_TAB_CONFIG } from "@/constants/Filter/BatchFilterConfig";

const emptySubscribe = () => () => {};

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);

  const [search, setSearch] = useState<string>("");
  const [selectedPurchase, setSelectedPurchase] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { activeTab, setActiveTab } = useStatusFilter({
    data: purchases,
    initialStatus: "unpaid",
  });

  const { activeBatchTab, setActiveBatchTab } = useBatchFilter({
    data: purchases,
    initialBatch: "all",
  });

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [purchaseStats, setPurchaseStats] = useState<PurchaseStats>({
    total_monthly_purchase: 0,
    total_pending_purchase: 0,
    total_monthly_paid_purchase: 0,
    total_remaining_bill: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const loadData = useCallback(
    async (
      pageNumber = 1,
      status: StatusFilter = "unpaid",
      startDate?: string,
      endDate?: string,
      batchStatus: BatchStatus = "all",
    ) => {
      try {
        setLoading(true);
        const data = await PurchaseService.getPurchases(
          pageNumber,
          status === "all" ? undefined : status,
          startDate,
          endDate,
          batchStatus === "all" ? undefined : batchStatus,
        );
        setPurchases(data.data.data || []);
        setCurrentPage(data.data.meta?.current_page || 1);
        setLastPage(data.data.meta?.last_page || 1);
        setTotalItems(data.data.meta?.total || 0);

        const metaStats = data.data?.meta?.stats;
        if (metaStats) {
          setPurchaseStats({
            total_monthly_purchase: metaStats.total_monthly_purchase || 0,
            total_pending_purchase: metaStats.total_pending_purchase || 0,
            total_monthly_paid_purchase:
              metaStats.total_monthly_paid_purchase || 0,
            total_remaining_bill: metaStats.total_remaining_bill || 0,
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
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
        await loadData(
          currentPage,
          activeTab,
          startDate,
          endDate,
          activeBatchTab,
        );
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [loadData, currentPage, activeTab, startDate, endDate, activeBatchTab]);

  const handleTabChange = (status: StatusFilter) => {
    setActiveTab(status);
    setCurrentPage(1);
  };

  const handleBatchTabChange = (status: BatchStatus) => {
    setActiveBatchTab(status);
    setCurrentPage(1);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenPaymentModal = () => setIsModalPaymentOpen(true);
  const handleClosePaymentModal = () => setIsModalPaymentOpen(false);

  const handleSuccess = () =>
    loadData(currentPage, activeTab, startDate, endDate, activeBatchTab);

  const handleDeleteClick = useCallback((id: number, name: string) => {
    setSelectedPurchase({ id, name });
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeletePurchase = async () => {
    if (!selectedPurchase) return;
    try {
      setIsDeleting(true);
      await PurchaseService.deletePurchase(selectedPurchase.id);
      toast.success("Purchase Deleted", {
        description: `${selectedPurchase.name} has been removed.`,
      });
      setIsDeleteModalOpen(false);
      loadData(1, activeTab, startDate, endDate, activeBatchTab);
    } catch (error) {
      toast.error("Failed to delete purchase: " + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = useMemo(() => {
    return purchases.filter((purchase) => {
      const invoiceNumber = (purchase.invoice_number || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const supplierName = (purchase.supplier?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const productName = (purchase.items || []).some((item) => {
        return (item.product?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase());
      });
      return invoiceNumber || supplierName || productName;
    });
  }, [purchases, search]);

  const columns = useMemo(
    () => PurchaseColumns(handleDeleteClick),
    [handleDeleteClick],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Purchases
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your bills to suppliers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonNav
            onClick={handleOpenModal}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
          >
            Add Purchases
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
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Purchases"
        size="lg"
      >
        <PurchaseForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
      </BaseModal>
      <BaseModal
        isOpen={isModalPaymentOpen}
        onClose={handleClosePaymentModal}
        title="Pay Suppliers"
        size="md"
      >
        <SupplierPaymentForm
          onSuccess={handleSuccess}
          onCancel={handleClosePaymentModal}
        />
      </BaseModal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Purchases This Month"
          value={purchaseStats.total_monthly_purchase}
          icon={<Receipt className="w-6 h-6" />}
          iconBgColor="bg-rose-500/10"
          iconColor="text-rose-500"
        />
        <StatsCard
          title="Purchases Pending"
          value={purchaseStats.total_pending_purchase}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-amber-500/10"
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Purchases Paid This Month"
          value={purchaseStats.total_monthly_paid_purchase}
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <StatsCard
          title="Remaining Bills"
          value={
            isClient ? formatRupiah(purchaseStats.total_remaining_bill) : "Rp 0"
          }
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-primary-brand/10"
          iconColor="text-primary-brand"
        />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 bg-zinc-50/50 border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs focus-within:bg-white focus-within:border-brand-dark focus-within:ring-4 focus-within:ring-brand-dark/5 transition-all duration-200 flex-1 md:flex-initial">
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

          <div className="w-full md:max-w-xs flex-1 md:flex-initial">
            <div className="group relative flex items-center bg-zinc-50/50 hover:bg-white border border-zinc-200 rounded-xl px-3.5 shadow-2xs focus-within:bg-white focus-within:border-brand-dark focus-within:ring-4 focus-within:ring-brand-dark/5 transition-all duration-200 w-full">
              <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-brand-dark transition-colors shrink-0" />
              <input
                type="text"
                placeholder="Search purchases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-2.5 pr-1 py-2.5 bg-transparent text-xs text-zinc-800 placeholder-zinc-400 font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200 pb-3 gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-brand-dark">
              Your Purchases List
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Showing{" "}
              <span className="text-brand-dark font-semibold">
                {activeBatchTab}
              </span>{" "}
              batch with{" "}
              <span className="text-brand-dark font-semibold">{activeTab}</span>{" "}
              invoices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto shadow-inner">
              {BATCH_TAB_CONFIG.map((tab) => {
                const isActive = activeBatchTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleBatchTabChange(tab.id)}
                    className={`flex-1 sm:flex-initial text-center px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-white text-brand-dark shadow-xs border border-zinc-200/60 scale-[1.01]"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:block text-zinc-300 font-light text-sm">
              /
            </div>

            <div className="flex items-center gap-1 bg-zinc-100/60 p-1 rounded-xl w-full sm:w-auto shadow-inner border border-zinc-200/40">
              {FILTER_TABS_CONFIG.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-brand-dark text-white shadow-xs"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
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
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePurchase}
        isLoading={isDeleting}
        title="Delete Purchase"
        message={`Are you sure you want to delete ${selectedPurchase?.name}?`}
        type="delete"
      />
    </div>
  );
}
