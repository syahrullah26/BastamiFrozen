"use client";
import React, { useState, useEffect, useCallback } from "react";

import { toast } from "sonner";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/product";
import { ProductColumns } from "@/constants/DataTable/productData";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { Plus, Package } from "lucide-react";
import axios from "axios";
import StatsCard from "@/components/ui/card/StatsCard";
import TableData from "@/components/ui/Table/TableData";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { ProductForm } from "@/components/ui/form/ProductForm";
import ProductsHeader from "./_components/ProdcutHeader";
import GlobalLoader from "@/components/ui/common/GlobalLoading";
import ProductTableHeader from "./_components/ProductTableHeader";

export default function ProductsPage() {
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
        <ProductsHeader />
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

      <div className="grid grid-cols-1  gap-4">
        <StatsCard
          title="Total Product"
          value={totalItems ? totalItems.toString() : "0"}
          icon={<Package />}
        />
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

      <ProductTableHeader
        search={search}
        onSearchChange={(value) => setSearch(value)}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <GlobalLoader message="Loading..." fullScreen={false} />
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
