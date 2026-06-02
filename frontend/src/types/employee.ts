import { Expense } from "./expense";

export interface Attendance {
  id: number;
  employee_id: number;
  attendace_date: string;
  status: string;
  notes?: string;
  employee: Employee;
  expense: Expense;
}

export interface Employee {
  id: number;
  name: string;
  salary: number;
  status: EmployeeStatus;
  attendance: Attendance[];
  expense: Expense[];
}

export type EmployeeStatus = "active" | "inactive";

export interface EmployeeRequest {
  name: string;
  salary: number;
  status: string;
}

export interface EmployeeStats {
  total_daily_salary: number;
}

export type AttendanceStatus =
  | "present"
  | "absent"
  | "leave"
  | "leave_with_permission";

export interface AttendanceRequest {
  employee_id: number;
  attendace_date: string;
  status: string;
  notes?: string;
}

export interface AttendanceStats {
  total_present: number;
  total_absent: number;
  total_leave: number;
  total_salary_expense: number;
}
