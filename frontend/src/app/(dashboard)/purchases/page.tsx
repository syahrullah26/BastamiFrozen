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
import { Purchase, PurchaseStats } from "@/types/purchase";
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
import { PurchaseColumns } from "@/constants/DataTable/purchaseData";
import { formatRupiah } from "@/utils/helper";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { PurchaseForm } from "@/components/ui/form/PurchaseForm";
import { SupplierPaymentForm } from "@/components/ui/form/SupplierPaymentForm";

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

  const loadData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await PurchaseService.getPurchases(pageNumber);
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await loadData(currentPage);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [loadData, currentPage]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenPaymentModal = () => setIsModalPaymentOpen(true);
  const handleClosePaymentModal = () => setIsModalPaymentOpen(false);

  const handleSuccess = () => loadData(currentPage);

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
      loadData();
    } catch (error) {
      toast.error("Failed to delete purchase: " + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const totalPeriod = purchases.filter((item) => {
      if (!item.transaction_date) return false;
      const transactionDate = new Date(item.transaction_date);
      return (
        transactionDate.getFullYear() === currentYear &&
        transactionDate.getMonth() === currentMonth
      );
    });

    const totalPending = purchases.filter((item) => item.status === "unpaid");

    const totalPaid = purchases.filter((item) => {
      if (!item.transaction_date) return false;
      const transactionDate = new Date(item.transaction_date);
      return (
        item.status === "paid" &&
        transactionDate.getFullYear() === currentYear &&
        transactionDate.getMonth() === currentMonth
      );
    });

    const remainingBills = purchases.reduce((acc, currentPurchase) => {
      return acc + (Number(currentPurchase.remaining_bill) || 0);
    }, 0);

    return {
      totalPeriodLength: totalPeriod.length,
      totalPendingLength: totalPending.length,
      totalPaidLength: totalPaid.length,
      remainingBills,
    };
  }, [purchases]);

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
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Purchases
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your bills to suppliers
          </p>
        </div>
        <div className="flex flex-col gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
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

      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <StatsCard
          title="Remaining Bills"
          value={isClient ? formatRupiah(purchaseStats.total_remaining_bill) : "Rp 0"}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-primary-brand/10"
          iconColor="text-primary-brand"
        />
      </div>

      <div className="bg-snow-white rounded-xl shadow-xs border border-brand-dark/30 overflow-hidden">
        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all border border-zinc-200/50 dark:border-white/10 cursor-pointer">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1" />
          </div>

          <div className="group w-full sm:max-w-xs flex items-center bg-ghost-white border border-brand-dark/50 rounded-xl px-3 focus-within:border-brand-dark transition-all">
            <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-brand-dark transition-colors" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-2 pr-2 py-2.5 bg-transparent text-xs focus:outline-none transition-all"
            />
          </div>
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

      <div className="flex items-start">
        <span className="text-xl font-bold text-brand-dark md:text-2xl mt-3.5 ml-3.5">
          Your Purchases List
        </span>
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
  );
}
