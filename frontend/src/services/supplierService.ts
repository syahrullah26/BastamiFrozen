import { axiosInstance } from "@/lib/axios";
import { Supplier, SupplierRequest, SupplierStats } from "@/types/supplier";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";

export const SupplierService = {
  async getSuppliers(
    page: number = 1,
  ): Promise<PaginatedApiResponse<Supplier, SupplierStats>> {
    try {
      const response = await axiosInstance.get("/suppliers", {
        params: {
          page: page,
        },
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  getAllSuppliers: async (): Promise<Supplier[]> => {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<Supplier[]>>("/suppliers/options");
      return data.data?.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getSupplier(id: string | number): Promise<Supplier> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<Supplier>>(
        `/suppliers/${cleanId}`,
      );
      const supplierData = data.data?.data || data.data;
      if (!supplierData) {
        throw new Error("Supplier data not found in server response");
      }
      return supplierData as Supplier;
    } catch (error) {
      throw error;
    }
  },

  async createSupplier(payload: SupplierRequest): Promise<Supplier> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Supplier>>(
        "/suppliers ",
        payload,
      );

      if (!data.status) {
        throw new Error(data.message) || "Failed to create supplier";
      }
      return data.data?.data;
    } catch (error) {
      throw error;
    }
  },

  async updateSupplier(id: string | number, payload: SupplierRequest) {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Supplier>>(
        `/suppliers/${id}`,
        payload,
      );

      if (!data.status) {
        throw new Error(data.message) || "Failed to update supplier";
      }
      return data.data?.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteSupplier(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/suppliers/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
