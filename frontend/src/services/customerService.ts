import { axiosInstance } from "@/lib/axios";
// import { AxiosError } from "axios";
import { Customer, CustomerRequest, CustomerStats } from "@/types/customer";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";

export const CustomerService = {
  async getCustomers(
    page: number = 1,
  ): Promise<PaginatedApiResponse<Customer, CustomerStats>> {
    try {
      const response = await axiosInstance.get("/customers", {
        params: {
          page: page,
        },
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Customer[]>>(
        "/customers/options",
      );
      return data.data?.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },

  async getCustomer(id: string | number): Promise<Customer> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<Customer>>(
        `/customers/${cleanId}`,
      );
      const customerData = data.data?.data || data.data;
      if (!customerData) {
        throw new Error("Customer data not found in server response");
      }
      return customerData as Customer;
    } catch (error) {
      throw error;
    }
  },

  async createCustomer(payload: CustomerRequest): Promise<Customer> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Customer>>(
        "/customers ",
        payload,
      );

      if (!data.status) {
        throw new Error(data.message) || "Failed to create customer";
      }
      return data.data?.data;
    } catch (error) {
      throw error;
    }
  },
  async updateCustomer(id: string | number, payload: CustomerRequest) {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Customer>>(
        `/customers/${id}`,
        payload,
      );

      if (!data.status) {
        throw new Error(data.message) || "Failed to update customer";
      }
      return data.data?.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteCustomer(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/customers/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
