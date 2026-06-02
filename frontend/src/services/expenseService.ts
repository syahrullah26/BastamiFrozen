import { axiosInstance } from "@/lib/axios";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";
import { Expense, ExpenseRequest, ExpenseStats } from "@/types/expense";

export const ExpenseService = {
  async getExpenses(page: number = 1): Promise<PaginatedApiResponse<Expense, ExpenseStats>> {
    try {
      const response = await axiosInstance.get("/expenses", {
        params: { page: page },
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getAllExpenses(): Promise<Expense[]> {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<Expense[]>>("/expenses/options");
      return data.data?.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getExpense(id: string | number): Promise<Expense> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<Expense>>(
        `/expenses/${cleanId}`,
      );
      const expenseData = data.data?.data || data.data;
      if (!expenseData) {
        throw new Error("Expense not found in server response");
      }
      return expenseData as Expense;
    } catch (error) {
      throw error;
    }
  },

  async createExpense(payload: ExpenseRequest): Promise<Expense> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Expense>>(
        "/expenses",
        payload,
      );
      if (!data.status) {
        throw new Error(data.message) || "Failed to create expense";
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },

  async updateExpense(
    id: string | number,
    payload: ExpenseRequest,
  ): Promise<Expense> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.put<ApiResponse<Expense>>(
        `/expenses/${cleanId}`,
        payload,
      );
      if (!data.status) {
        throw new Error(data.message) || "Failed to update expense";
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteExpense(id: string | number): Promise<void> {
    try {
      const cleanId = String(id).trim();
      await axiosInstance.delete(`/expenses/${cleanId}`);
    } catch (error) {
      throw error;
    }
  },
};
