import { axiosInstance } from "@/lib/axios";
import { Product } from "@/types/product";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";

export const ProductService = {
  async getProducts(): Promise<Product[]> {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<Product[]>>("/products");
      return data.data?.data || [];
    } catch (error) {
      return this.handleError(error);
    }
  },

  async getProduct(id: number): Promise<Product> {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      const result = response.data;
      if (!result.status) {
        throw new Error(result.message);
      }
      return result.data;
    } catch (error) {
      return this.handleError(error);
    }
  },
  handleError(error: unknown): never {
    let message = "Server Error";

    if (error instanceof AxiosError) {
      message = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error("API Service Error:", message);
    throw new Error(message);
  },
};
