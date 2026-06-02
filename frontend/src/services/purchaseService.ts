import { axiosInstance } from "@/lib/axios";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";
import { Purchase, PurchaseRequest, PurchaseStats } from "@/types/purchase";

export const PurchaseService = {
  async getPurchases(
    page: number = 1,
  ): Promise<PaginatedApiResponse<Purchase, PurchaseStats>> {
    try {
      const response = await axiosInstance.get("/purchases", {
        params: {
          page: page,
        },
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  async getAllPurchase(): Promise<Purchase[]> {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<Purchase[]>>("/purchases/options");
      return data.data?.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getPurchase(id: string | number): Promise<Purchase> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<Purchase>>(
        `/purchases/${cleanId}`,
      );
      const purchaseData = data.data?.data || data.data;
      if (!purchaseData) {
        throw new Error("Purchase data not found in server response");
      }
      return purchaseData as Purchase;
    } catch (error) {
      throw error;
    }
  },

  async createPurchase(payload: PurchaseRequest): Promise<Purchase> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Purchase>>(
        "/purchases",
        payload,
      );
      if (!data.status) {
        throw new Error(data.message) || "Failed to create purchase";
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },
  async updatePurchase(
    id: string | number,
    payload: PurchaseRequest,
  ): Promise<Purchase> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.put<ApiResponse<Purchase>>(
        `/purchases/${cleanId}`,
        payload,
      );
      if (!data.status) {
        throw new Error(data.message) || "Failed to update purchase";
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePurchase(id: number) {
    try {
      await axiosInstance.delete(`/purchases/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
