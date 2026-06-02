import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/types/apiResponse";
import { FinancialReport } from "@/types/financialReport";

export const FinancialReportService = {
  async getProfitLossReport(
    type: string,
    date: string,
  ): Promise<FinancialReport> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<FinancialReport>>(
        "/financial-report",
        {
          params: {
            type: type,
            date: date,
          },
        },
      );
      return data.data.data as FinancialReport;
    } catch (error) {
      throw error;
    }
  },
};
