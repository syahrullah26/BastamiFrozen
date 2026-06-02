import { axiosInstance } from "@/lib/axios";
import { Product, ProductRequest } from "@/types/product";
import { AxiosError } from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";

export const ProductService = {
  async getProducts(page: number = 1): Promise<PaginatedApiResponse<Product>> {
    try {
      const response = await axiosInstance.get("/products", {
        params: { page },
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<Product[]>>("/products/options");
      return data.data?.data || data.data || [];
    } catch (error) {
      return this.handleError(error);
    }
  },
  async getProduct(id: string | number): Promise<Product> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<Product>>(
        `/products/${cleanId}`,
      );
      const productData = data.data?.data || data.data;

      if (!productData) {
        throw new Error("Product data not found in server response");
      }

      return productData as Product;
    } catch (error) {
      return this.handleError(error);
    }
  },

  async createProduct(payload: ProductRequest): Promise<Product> {
    try {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("stock", payload.stock.toString());

      if (payload.image) {
        formData.append("image", payload.image);
      }
      if (payload.units && payload.units.length > 0) {
        payload.units.forEach((unit, index) => {
          formData.append(`units[${index}][unit_name]`, unit.unit_name);
          formData.append(
            `units[${index}][conversion_factor]`,
            unit.conversion_factor.toString(),
          );
          formData.append(`units[${index}][price]`, unit.price.toString());
        });
      }
      const { data } = await axiosInstance.post<ApiResponse<Product>>(
        "/products",
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        },
      );
      if (!data.status) {
        throw new Error(data.message || "Create Product Failed");
      }
      return data.data?.data;
    } catch (error) {
      return this.handleError(error);
    }
  },

  async updateProduct(
    id: string | number,
    payload: ProductRequest,
  ): Promise<Product> {
    try {
      const formData = new FormData();

      formData.append("_method", "PUT");
      formData.append("name", payload.name);
      formData.append("stock", payload.stock.toString());

      if (payload.image) {
        formData.append("image", payload.image);
      }

      if (payload.units && payload.units.length > 0) {
        payload.units.forEach((unit, index) => {
          formData.append(`units[${index}][unit_name]`, unit.unit_name);
          formData.append(
            `units[${index}][conversion_factor]`,
            unit.conversion_factor.toString(),
          );
          formData.append(`units[${index}][price]`, unit.price.toString());
        });
      }

      const { data } = await axiosInstance.post<ApiResponse<Product>>(
        `/products/${id}`,
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        },
      );

      if (!data.status) {
        throw new Error(data.message || "Update Product Failed");
      }

      return data.data?.data;
    } catch (error) {
      return this.handleError(error);
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/products/${id}`);
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
