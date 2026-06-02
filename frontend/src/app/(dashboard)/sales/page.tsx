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
import { SaleService } from "@/services/saleService";
import { Sale, SaleStats } from "@/types/sale";
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
import { CustomerPaymentForm } from "@/components/ui/form/CustomerPaymentForm";

const emptySubscribe = () => () => {};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const [isPaymentModalOpen, setIsModalPaymentOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const loadData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await SaleService.getSales(pageNumber);
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

  const handleDeleteClick = useCallback((id: number, name: string) => {
    setSelectedSale({ id, name });
    setIsDeleteModalOpen(true);
  }, []);

  const handleSuccess = () => loadData();

  const handleDeleteSale = async () => {
    if (!selectedSale) return;
    try {
      setIsDeleting(true);
      await SaleService.deleteSale(selectedSale.id);
      toast.success("Purchase Deleted", {
        description: `${selectedSale.name} has been removed.`,
      });
      loadData();
    } catch (error) {
      toast.error("Failed to delete sale :" + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const totalPeriod = sales.filter((item) => {
      if (!item.transaction_date) return false;
      const transactionDate = new Date(item.transaction_date);
      return (
        transactionDate.getFullYear() === currentYear &&
        transactionDate.getMonth() === currentMonth
      );
    });

    const totalPending = sales.filter((item) => item.status === "unpaid");

    const totalPaid = sales.filter((item) => {
      if (!item.transaction_date) return false;
      const transactionDate = new Date(item.transaction_date);
      return (
        item.status === "paid" &&
        transactionDate.getFullYear() === currentYear &&
        transactionDate.getMonth() === currentMonth
      );
    });

    const remainingBills = sales.reduce((acc, currentPurchase) => {
      return acc + (Number(currentPurchase.amount.remaining_bill) || 0);
    }, 0);

    return {
      totalPeriodLength: totalPeriod.length,
      totalPendingLength: totalPending.length,
      totalPaidLength: totalPaid.length,
      remainingBills,
    };
  }, [sales]);

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
    () => SaleColumns(handleDeleteClick),
    [handleDeleteClick],
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
          value={isClient ? formatRupiah(saleStats.total_remaining_bill) : "Rp 0"}
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
              placeholder="Search sales..."
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
        onConfirm={handleDeleteSale}
        isLoading={isDeleting}
        title="Delete Sales"
        message={`Are you sure you want to delete ${selectedSale?.name}?`}
        type="delete"
      />

      <div className="flex items-start">
        <span className="text-xl font-bold text-brand-dark md:text-2xl mt-3.5 ml-3.5">
          Your Sales List
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
