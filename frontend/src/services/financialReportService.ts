import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/apiResponse";
import { FinancialReport, DashboardData } from "@/types/financialReport";

export const FinancialReportService = {
  async getProfitLossReport(
    type: string = "monthly",
    date?: string,
  ): Promise<FinancialReport | null> {
    try {
      const response = await axiosInstance.get("/financial-report", {
        params: {
          type,
          date,
        },
      });
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
        return apiResponse.data as FinancialReport;
      }
      if (apiResponse && "summary" in apiResponse) {
        return apiResponse as FinancialReport;
      }

      return null;
    } catch (error) {
      throw error;
    }
  },
  async getDashboardData(
    type: string = "daily",
    date?: string,
  ): Promise<DashboardData | null> {
    try {
      const response = await axiosInstance.get("/financial-report/dashboard", {
        params: {
          type,
          date,
        },
      });
      return response.data.data || null;
    } catch (error) {
      throw error;
    }
  },
};
