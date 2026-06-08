import { axiosInstance } from "@/lib/axios";
import {
  Attendance,
  AttendanceRequest,
  AttendanceStats,
} from "@/types/employee";
import { ApiResponse, PaginatedApiResponse } from "@/types/apiResponse";

export const AttendanceService = {
  async getAttendances(
    page: number = 1,
    startDate?: string,
    endDate?: string,
    type?: string,
  ): Promise<PaginatedApiResponse<Attendance, AttendanceStats>> {
    try {
      const response = await axiosInstance.get("/attendances", {
        params: {
          page: page,
          startDate: startDate,
          endDate: endDate,
          type,
        },
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  async getAllAttendances(): Promise<Attendance[]> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Attendance[]>>(
        "/attendances/options",
      );
      return data.data?.data || data.data || [];
    } catch (error) {
      throw error;
    }
  },

  async getAttendance(id: string | number): Promise<Attendance> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.get<ApiResponse<Attendance>>(
        `/attendances/${cleanId}`,
      );
      const attendanceData = data.data?.data || data.data;
      if (!attendanceData) {
        throw new Error("Attendance data not found in server response");
      }
      return attendanceData as Attendance;
    } catch (error) {
      throw error;
    }
  },

  async createAttendance(payload: AttendanceRequest): Promise<Attendance> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Attendance>>(
        "/attendances",
        payload,
      );
      if (!data.status) {
        throw new Error(data.message) || "Failed to create attendance";
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },

  async updateAttendance(
    id: string | number,
    payload: AttendanceRequest,
  ): Promise<Attendance> {
    try {
      const cleanId = String(id).trim();
      const { data } = await axiosInstance.put<ApiResponse<Attendance>>(
        `/attendances/${cleanId}`,
        payload,
      );
      if (!data.status) {
        throw new Error("Failed to update attendance");
      }
      return data.data?.data || data.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteAttendance(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/attendances/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
