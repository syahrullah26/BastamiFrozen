"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductService } from "@/services/productService";
import { Product, ProductRequest } from "@/types/product";
import { ProductColumns } from "@/constants/DataTable/productData";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { Plus, Search, Filter, Package } from "lucide-react";
import axios from "axios";
import StatsCard from "@/components/ui/card/StatsCard";
import TableData from "@/components/ui/Table/TableData";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { ProductForm } from "@/components/ui/form/ProductForm";

export default function ProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await ProductService.getProducts(pageNumber);
      setProducts(data.data.data || []);
      setCurrentPage(data.data.meta?.current_page || 1);
      setLastPage(data.data.meta?.last_page || 1);
      setTotalItems(data.data.meta?.total || 0);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Gagal memuat data produk");
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

  const handleSuccess = () => {
    loadData();
  };
  const handleDeleteClick = (id: number, name: string) => {
    setSelectedProduct({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return null;
    try {
      setIsDeleting(true);
      await ProductService.deleteProduct(selectedProduct.id);
      toast.success("Product Deleted", {
        description: `${selectedProduct.name} has been removed.`,
      });
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Gagal menghapus produk :" + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalProduct = products.length;
  const columns = ProductColumns(handleDeleteClick);

  const filteredData = products.filter((item) => {
    const productName = item.name.toLowerCase().includes(search.toLowerCase());
    const unitName = item.units.some((unit) => {
      return unit.unit_name.toLowerCase().includes(search.toLowerCase());
    });
    return productName || unitName;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-dark">
            Products
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage and monitor your products
          </p>
        </div>
        <ButtonNav
          onClick={handleOpenModal}
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
          fullWidth={false}
        >
          Add Product
        </ButtonNav>
      </div>
      <BaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add New Product"
        size="lg"
      >
        <ProductForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
      </BaseModal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Total Product"
          value={totalItems ? totalItems.toString() : "0"}
          icon={<Package />}
          bgColor="bg-background/40"
        />
        <div className="bg-background/40 rounded-xl shadow-xs border border-brand-dark/30 overflow-hidden">
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
                placeholder="Search products..."
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
          onConfirm={handleDeleteProduct}
          isLoading={isDeleting}
          title="Delete Product"
          message={`Are you sure you want to delete order :${selectedProduct?.name}?`}
          type="delete"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-brand-dark"></div>
          <span className="text-xs font-semibold text-zinc-400 animate-pulse">
            Loading dashboard...
          </span>
        </div>
      ) : (
        <div className="w-full">
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
      )}
    </div>
  );
}
