import { axiosInstance } from "@/lib/axios";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";
import {
  CustomerPayment,
  CustomerPaymentRequest,
  CustomerPaymentStats,
  SupplierPayment,
  SupplierPaymentRequest,
  SupplierPaymentStats,
} from "@/types/payment";

export const PaymentService = {
  // Customer Payments
  getCustomerPayments: async (
    page: number = 1,
  ): Promise<PaginatedApiResponse<CustomerPayment, CustomerPaymentStats>> => {
    try {
      const response = await axiosInstance.get("/customer-payments", {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllPayments: async (): Promise<CustomerPayment[]> => {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<CustomerPayment[]>>(
          "/customer-payments/options",
        );
      return data.data.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getCustomerPayment(id: string | number): Promise<CustomerPayment> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<CustomerPayment>>(
        `/customer-payments/${cleanId}`,
      );
      const customerPaymentData = data.data?.data || data.data;
      if (!customerPaymentData) {
        throw new Error("Customer Payment data not found in server response");
      }
      return customerPaymentData as CustomerPayment;
    } catch (error) {
      throw error;
    }
  },
  async createCustomerPayment(
    payload: CustomerPaymentRequest,
  ): Promise<CustomerPayment> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<CustomerPayment>>(
        "/customer-payments",
        payload,
      );
      if (!data.status) {
        throw new Error(data.message || "Failed to create customer payment");
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },
  async updateCustomerPayment(
    id: string | number,
    payload: CustomerPaymentRequest,
  ): Promise<CustomerPayment> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.put<ApiResponse<CustomerPayment>>(
        `/customer-payments/${cleanId}`,
        payload,
      );
      if (!data.status) {
        throw new Error(data.message || "Failed to update customer payment");
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteCustomerPayment(id: string | number): Promise<void> {
    try {
      const cleanId = String(id).trim();
      await axiosInstance.delete(`/customer-payments/${cleanId}`);
    } catch (error) {
      throw error;
    }
  },

  //Supplier Payments
  getSupplierPayments: async (
    page: number = 1,
  ): Promise<PaginatedApiResponse<SupplierPayment, SupplierPaymentStats>> => {
    try {
      const response = await axiosInstance.get("/supplier-payments", {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllSupplierPayments: async (): Promise<SupplierPayment[]> => {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<SupplierPayment[]>>(
          "/supplier-payments/options",
        );
      return data.data?.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getSupplierPayment(id: string | number): Promise<SupplierPayment> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<SupplierPayment>>(
        `/supplier-payments/${cleanId}`,
      );
      const supplierPaymentData = data.data?.data || data.data;
      if (!supplierPaymentData) {
        throw new Error("Supplier Payment data not found in server response");
      }
      return supplierPaymentData as SupplierPayment;
    } catch (error) {
      throw error;
    }
  },
  async createSupplierPayment(
    payload: SupplierPaymentRequest,
  ): Promise<SupplierPayment> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<SupplierPayment>>(
        "/supplier-payments",
        payload,
      );
      if (!data.status) {
        throw new Error(data.message || "Failed to create supplier payment");
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },
  async updateSupplierPayment(
    id: string | number,
    payload: SupplierPaymentRequest,
  ): Promise<SupplierPayment> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.put<ApiResponse<SupplierPayment>>(
        `/supplier-payments/${cleanId}`,
        payload,
      );
      if (!data.status) {
        throw new Error(data.message || "Failed to update supplier payment");
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteSupplierPayment(id: string | number): Promise<void> {
    try {
      const cleanId = String(id).trim();
      await axiosInstance.delete(`/supplier-payments/${cleanId}`);
    } catch (error) {
      throw error;
    }
  },
};
