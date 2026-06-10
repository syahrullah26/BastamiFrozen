"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
  useMemo,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  CustomerPayment,
  SupplierPayment,
  CustomerPaymentStats,
  SupplierPaymentStats,
} from "@/types/payment";
import { PaymentService } from "@/services/paymentService";
import ButtonNav from "@/components/ui/button/ButtonNav";
import {
  Plus,
  Search,
  Users,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import TableData from "@/components/ui/Table/TableData";
import StatsCard from "@/components/ui/card/StatsCard";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { formatRupiah } from "@/utils/helper";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { CustomerPaymentForm } from "@/components/ui/form/CustomerPaymentForm";
import { SupplierPaymentForm } from "@/components/ui/form/SupplierPaymentForm";
import {
  SupplierPaymentColumns,
  CustomerPaymentColumns,
} from "@/constants/DataTable/paymentsData";
import HeaderPayment from "./_components/HeaderPayment";
import StatsPayment from "./_components/StatsPayment";
import FilterPayment from "./_components/FilterPayment";

const emptySubscribe = () => () => {};

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"customer" | "supplier">(
    "customer",
  );
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(
    [],
  );
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(
    [],
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [selectedCustomerPayment, setSelectedCustomerPayment] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedSupplierPayment, setSelectedSupplierPayment] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [supplierStats, setSupplierStats] = useState<SupplierPaymentStats>({
    total_cash_out_flow: 0,
  });
  const [customerStats, setCustomerStats] = useState<CustomerPaymentStats>({
    total_cash_in_flow: 0,
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
    async (pageNumber = 1) => {
      try {
        setLoading(true);
        const [customerRes, supplierRes] = await Promise.all([
          PaymentService.getCustomerPayments(pageNumber),
          PaymentService.getSupplierPayments(pageNumber),
        ]);

        const customerListData = customerRes.data?.data || [];
        const supplierListData = supplierRes.data?.data || [];

        setCustomerPayments(customerListData);
        setSupplierPayments(supplierListData);

        if (activeTab === "customer") {
          const customerMeta = customerRes.data?.meta;
          setCurrentPage(customerMeta?.current_page || 1);
          setLastPage(customerMeta?.last_page || 1);
          setTotalItems(customerMeta?.total || 0);
          const customerMetaStats = customerRes.data?.meta?.stats;
          if (customerMetaStats) {
            setCustomerStats({
              total_cash_in_flow: customerMetaStats.total_cash_in_flow || 0,
            });
          }
        } else {
          const supplierMeta = supplierRes.data?.meta;
          setCurrentPage(supplierMeta?.current_page || 1);
          setLastPage(supplierMeta?.last_page || 1);
          setTotalItems(supplierMeta?.total || 0);
          const supplierMetaStats = supplierRes.data?.meta?.stats;
          if (supplierMetaStats) {
            setSupplierStats({
              total_cash_out_flow: supplierMetaStats.total_cash_out_flow || 0,
            });
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Unauthorized access");
        } else {
          toast.error("Failed to load payments data");
        }
      } finally {
        setLoading(false);
      }
    },
    [activeTab],
  );
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
  }, [currentPage, loadData]);

  const stats = useMemo(() => {
    const totalIn = customerPayments.reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0,
    );
    const totalOut = supplierPayments.reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0,
    );

    return {
      totalCustomerRevenue: isClient ? formatRupiah(totalIn) : "Rp 0",
      totalSupplierExpense: isClient ? formatRupiah(totalOut) : "Rp 0",
      customerCount:
        totalItems && activeTab === "customer"
          ? totalItems
          : customerPayments.length,
      supplierCount:
        totalItems && activeTab === "supplier"
          ? totalItems
          : supplierPayments.length,
    };
  }, [customerPayments, supplierPayments, isClient, totalItems, activeTab]);

  const handleDeleteCustomerClick = useCallback((id: number, name: string) => {
    setSelectedCustomerPayment({ id, name });
  }, []);

  const handleDeleteSupplierClick = useCallback((id: number, name: string) => {
    setSelectedSupplierPayment({ id, name });
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowCustomerModal(false);
    setShowSupplierModal(false);
  }, []);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (selectedCustomerPayment) {
        await PaymentService.deleteCustomerPayment(selectedCustomerPayment.id);
        toast.success("Customer payment record deleted");
        setSelectedCustomerPayment(null);
      } else if (selectedSupplierPayment) {
        await PaymentService.deleteSupplierPayment(selectedSupplierPayment.id);
        toast.success("Supplier payment record deleted");
        setSelectedSupplierPayment(null);
      }
      await loadData(currentPage);
    } catch (error) {
      toast.error("Failed to delete transaction record: " + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCustomerData = useMemo(() => {
    return customerPayments.filter(
      (cp) =>
        cp.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        cp.customer?.phone?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [customerPayments, search]);

  const filteredSupplierData = useMemo(() => {
    return supplierPayments.filter(
      (sp) =>
        sp.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
        sp.supplier?.information?.phone
          ?.toLowerCase()
          .includes(search.toLowerCase()),
    );
  }, [supplierPayments, search]);

  const columnsCustomer = useMemo(
    () => CustomerPaymentColumns(handleDeleteCustomerClick),
    [handleDeleteCustomerClick],
  );
  const columnsSupplier = useMemo(
    () => SupplierPaymentColumns(handleDeleteSupplierClick),
    [handleDeleteSupplierClick],
  );

  return (
    <div className="space-y-7 p-1">
      <HeaderPayment
        setShowCustomerModal={setShowCustomerModal}
        setShowSupplierModal={setShowSupplierModal}
      />
      <StatsPayment
        customerStats={customerStats}
        supplierStats={supplierStats}
        supplierCount={stats.supplierCount}
        customerCount={stats.customerCount}
      />

      <FilterPayment
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
        stats={stats}
      />

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 overflow-hidden">
        {activeTab === "customer" ? (
          <TableData
            columns={columnsCustomer}
            data={filteredCustomerData}
            loading={loading}
            pagination={{
              currentPage: currentPage,
              lastPage: lastPage,
              totalItems: totalItems,
              onPageChange: (newPage) => setCurrentPage(newPage),
            }}
          />
        ) : (
          <TableData
            columns={columnsSupplier}
            data={filteredSupplierData}
            loading={loading}
            pagination={{
              currentPage: currentPage,
              lastPage: lastPage,
              totalItems: totalItems,
              onPageChange: (newPage) => setCurrentPage(newPage),
            }}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!selectedCustomerPayment || !!selectedSupplierPayment}
        onClose={() => {
          setSelectedCustomerPayment(null);
          setSelectedSupplierPayment(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction Record"
        message={`Are you sure you want to completely erase the payment logs for ${selectedCustomerPayment?.name || selectedSupplierPayment?.name || "this entity"}? Action is permanent.`}
        isLoading={isDeleting}
      />

      <BaseModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Create Customer Payment Record"
      >
        <CustomerPaymentForm
          onSuccess={() => {
            setShowCustomerModal(false);
            setCurrentPage(1);
            loadData(1);
          }}
          onCancel={handleCloseModal}
        />
      </BaseModal>

      <BaseModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title="Create Supplier Payment Record"
      >
        <SupplierPaymentForm
          onSuccess={() => {
            setShowSupplierModal(false);
            setCurrentPage(1);
            loadData(1);
          }}
          onCancel={handleCloseModal}
        />
      </BaseModal>
    </div>
  );
}
