"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CustomerService } from "@/services/customerService";
import { Customer, CustomerStats } from "@/types/customer";
import TableData from "@/components/ui/Table/TableData";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { Plus, Search, Filter, Users, DollarSign, FilePen } from "lucide-react";
import StatsCard from "@/components/ui/card/StatsCard";
import { CustomerColumns } from "@/constants/DataTable/customerData";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { CustomerForm } from "@/components/ui/form/CustomerForm";
import { formatRupiah } from "@/utils/helper";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    total_unpaid: 0,
    total_remaining_bills: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await CustomerService.getCustomers(pageNumber);

      setCustomers(response.data.data || []);
      setCurrentPage(response.data.meta?.current_page || 1);
      setLastPage(response.data.meta?.last_page || 1);
      setTotalItems(response.data.meta?.total || 0);

      const metaStats = response.data.meta?.stats;
      if (metaStats) {
        setCustomerStats({
          total_unpaid: metaStats.total_unpaid || 0,
          total_remaining_bills: metaStats.total_remaining_bills || 0,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to load customers");
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
  }, [currentPage, loadData]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSuccess = () => {
    setCurrentPage(1);
    loadData(1);
  };

  const handleDeleteClick = async (id: number, name: string) => {
    setSelectedCustomer({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return null;
    try {
      setIsDeleting(true);
      await CustomerService.deleteCustomer(selectedCustomer.id);
      toast.success("Customer Deleted", {
        description: `${selectedCustomer.name} has been removed.`,
      });
      setIsDeleteModalOpen(false);
      loadData(currentPage);
    } catch (error) {
      toast.error("Failed to delete customer :" + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = customers.filter((item) => {
    const name =
      item.name?.toLowerCase().includes(search.toLowerCase()) || false;
    const address =
      item.location?.toLowerCase().includes(search.toLowerCase()) || false;
    const phone =
      item.phone?.toLowerCase().includes(search.toLowerCase()) || false;
    return name || address || phone;
  });

  const columns = CustomerColumns(handleDeleteClick);

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Customers
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your customers bills
          </p>
        </div>
        <ButtonNav
          onClick={handleOpenModal}
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
          fullWidth={false}
        >
          Add Customer
        </ButtonNav>
        <BaseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Add Customer"
          size="md"
        >
          <CustomerForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
        </BaseModal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <StatsCard
          title="Total Customers"
          value={totalItems}
          icon={<Users className="w-6 h-6" />}
          iconColor="text-primary-brand"
          iconBgColor="bg-primary-brand/10"
        />
        <StatsCard
          title="Unpaid Invoices"
          value={customerStats.total_unpaid}
          icon={<FilePen className="w-6 h-6" />}
          iconColor="text-orange-400"
          iconBgColor="bg-orange-400/10"
        />
        <StatsCard
          title="Remaining Bills"
          value={formatRupiah(customerStats.total_remaining_bills)}
          icon={<DollarSign className="w-6 h-6" />}
          iconColor="text-red-400"
          iconBgColor="bg-red-400/10"
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
              placeholder="Search customers..."
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
        onConfirm={handleDeleteCustomer}
        isLoading={isDeleting}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedCustomer?.name}?`}
        type="delete"
      />

      <div className="flex items-start">
        <span className="text-xl font-bold text-brand-dark md:text-2xl mt-3.5 ml-3.5">
          Customer List
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
