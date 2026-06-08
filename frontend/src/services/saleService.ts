import { axiosInstance } from "@/lib/axios";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";
import {
  Sale,
  SaleRequest,
  SaleStats,
  BackfillPayload,
  StatusFilter,
} from "@/types/sale";

export const SaleService = {
  async getSales(
    page: number,
    status?: StatusFilter,
    startDate?: string,
    endDate?: string,
  ): Promise<PaginatedApiResponse<Sale, SaleStats>> {
    try {
      const response = await axiosInstance.get("/sales", {
        params: {
          page,
          status,
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  async getAllSales(): Promise<Sale[]> {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<Sale[]>>("/sales/options");
      return data.data?.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },

  async getSale(id: string | number): Promise<Sale> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<Sale>>(
        `/sales/${cleanId}`,
      );
      const saleData = data.data?.data || data.data;
      if (!saleData) {
        throw new Error("Sale data not found in server response");
      }
      return saleData as Sale;
    } catch (error) {
      throw error;
    }
  },
  async createSale(payload: SaleRequest): Promise<Sale> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Sale>>(
        "/sales",
        payload,
      );
      if (!data.status) {
        throw new Error("Failed to create sale");
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },

  async updateSale(id: number | string, payload: SaleRequest): Promise<Sale> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.put<ApiResponse<Sale>>(
        `/sales/${cleanId}`,
        payload,
      );
      if (!data.status) {
        throw new Error("Failed to update sale");
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },

  triggerBackfill: async (payload?: BackfillPayload) => {
    try {
      const response = await axiosInstance.post("/sales/backfill-hpp", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteSale(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/sales/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
