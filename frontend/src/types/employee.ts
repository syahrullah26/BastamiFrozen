import { Expense } from "./expense";

export interface Attendance {
  id: number;
  employee_id: number;
  attendace_date: string;
  status: string;
  notes: string;
  employee: Employee;
  expense: Expense;
}

export interface Employee {
  id: number;
  name: string;
  salary: number;
  attendance: Attendance[];
}
