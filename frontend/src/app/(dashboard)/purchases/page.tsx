"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PurchaseService } from "@/services/purchaseService";
import { Purchase, PurchaseStats, BatchStatus } from "@/types/purchase";
import { StatusFilter } from "@/types/sale";
import TableData from "@/components/ui/Table/TableData";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { PurchaseColumns } from "@/constants/DataTable/purchaseData";
import { useStatusFilter } from "@/hooks/useStatusFilter";
import { FILTER_TABS_CONFIG } from "@/constants/Filter/StatusFilterConfig";
import { useBatchFilter } from "@/hooks/useBatchFilter";
import { BATCH_TAB_CONFIG } from "@/constants/Filter/BatchFilterConfig";
import PurchaseHeader from "./_components/PurchaseHeader";
import PurchaseStatsCard from "./_components/PurchaseStatsCard";
import PurchaseFilter from "./_components/PurchaseFilter";
import PurchaseActiveTab from "./_components/PurchaseActiveTab";

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

  // const handleTabChange = (status: StatusFilter) => {
  //   setActiveTab(status);
  //   setCurrentPage(1);
  // };

  // const handleBatchTabChange = (status: BatchStatus) => {
  //   setActiveBatchTab(status);
  //   setCurrentPage(1);
  // };

  const handleOpenModal = () => setIsModalOpen(true);
  // const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenPaymentModal = () => setIsModalPaymentOpen(true);
  // const handleClosePaymentModal = () => setIsModalPaymentOpen(false);

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
      <PurchaseHeader
        onSuccess={handleSuccess}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleOpenModal={handleOpenModal}
        handleOpenPaymentModal={handleOpenPaymentModal}
        isModalPaymentOpen={isModalPaymentOpen}
        setIsModalPaymentModal={setIsModalPaymentOpen}
      />

      <PurchaseStatsCard
        totalMonthlyPurchase={purchaseStats.total_monthly_purchase}
        totalPendingPurchase={purchaseStats.total_pending_purchase}
        totalPaidMonthlyPurchase={purchaseStats.total_monthly_paid_purchase}
        totalRemainingBill={purchaseStats.total_remaining_bill}
      />

      <PurchaseFilter
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        search={search}
        setSearch={setSearch}
      />

      <div className="space-y-4">
        <PurchaseActiveTab
          activeBatchTab={activeBatchTab}
          handleBatchTabChange={(id) => setActiveBatchTab(id as BatchStatus)}
          batchTabConfig={BATCH_TAB_CONFIG}
          activeTab={activeTab}
          handleTabChange={(id) => setActiveTab(id as StatusFilter)}
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
