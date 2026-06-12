"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { EmployeeService } from "@/services/employeeService";
import { Employee } from "@/types/employee";
import { toast } from "sonner";
import axios from "axios";
import HeaderEmployeeDetail from "./_components/HeaderEmployeeDetail";
import InformationEmployeeDetail from "./_components/InformationEmployeeDetail";
import StatsCardEmployeeDetail from "./_components/StatsEmployeeDetail";
import TableEmployeeDetail from "./_components/TableEmployeeDetail";

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const data = await EmployeeService.getEmployee(id);
        setEmployee(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        toast.error("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const presentAttendanceThisMonth =
    employee?.attendance?.filter((item) => {
      if (!item.attendace_date) return false;
      const attendanceDate = new Date(item.attendace_date);
      return (
        item.status === "present" &&
        attendanceDate.getMonth() === currentMonth &&
        attendanceDate.getFullYear() === currentYear
      );
    }) || [];
  const dailySalary = employee?.salary || 0;
  const totalPeriodSalary = presentAttendanceThisMonth.length * dailySalary;

  const getRecentAttendance = employee?.attendance
    ? employee.attendance.slice(-5).reverse()
    : [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <HeaderEmployeeDetail id={id} />
      <InformationEmployeeDetail
        employee={employee}
        totalPeriodSalary={totalPeriodSalary}
      />
      <StatsCardEmployeeDetail
        presentAttendanceThisMonth={presentAttendanceThisMonth.length}
        totalPeriodSalary={totalPeriodSalary}
      />
      <TableEmployeeDetail
        employee={employee}
        recentAttendance={getRecentAttendance}
        loading={loading}
      />
    </div>
  );
}
