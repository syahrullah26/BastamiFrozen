import { axiosInstance } from "@/lib/axios";
import { Employee, EmployeeRequest, EmployeeStats } from "@/types/employee";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";

export const EmployeeService = {
  async getEmployees(
    page: number = 1,
  ): Promise<PaginatedApiResponse<Employee, EmployeeStats>> {
    try {
      const response = await axiosInstance.get("/employees", {
        params: {
          page: page,
        },
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const { data } =
        await axiosInstance.get<ApiResponse<Employee[]>>("/employees/options");
      return data.data?.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },
  async getEmployee(id: string | number): Promise<Employee> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<Employee>>(
        `/employees/${cleanId}`,
      );
      const employeeData = data.data?.data || data.data;
      if (!employeeData) {
        throw new Error("Employee data not found in server response");
      }
      return employeeData as Employee;
    } catch (error) {
      throw error;
    }
  },
  async createEmployee(payload: EmployeeRequest): Promise<Employee> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Employee>>(
        "/employees",
        payload,
      );
      if (!data.status) {
        throw new Error(data.message) || "Failed to create employee";
      }
      return data.data?.data;
    } catch (error) {
      throw error;
    }
  },

  async updateEmployee(
    id: string | number,
    payload: EmployeeRequest,
  ): Promise<Employee> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.put<ApiResponse<Employee>>(
        `/employees/${cleanId}`,
        payload,
      );
      if (!data.status) {
        throw new Error(data.message) || "Failed to update employee";
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteEmployee(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/suppliers/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
