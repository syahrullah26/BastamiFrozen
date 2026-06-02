/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save } from "lucide-react";
import { Employee } from "@/types/employee";
import { EmployeeService } from "@/services/employeeService";
import { AttendanceRequest } from "@/types/employee";
import { AttendanceService } from "@/services/attendanceService";
import { toast } from "sonner";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import SearchableSelect from "@/components/ui/input/select/SearchableOptions";

interface AttendanceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}
interface SelectOption {
  value: number | string;
  label: string;
}

export const AttendanceForm = ({
  onSuccess,
  onCancel,
}: AttendanceFormProps) => {
  const [loading, setLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState("");
  const [notes, setNotes] = useState("");

  const [selectOption, setSelectOption] = useState<string | number>("");
  const [attendanceStatus, setAttendanceStatus] = useState<string>("");
  const [employee, setEmployee] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await EmployeeService.getAllEmployees();
        setEmployee(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        toast.error("Failed to load Employee Select Options");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectOption(selectedId);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value;
    setAttendanceStatus(selectedStatus);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: AttendanceRequest = {
      employee_id: Number(selectOption),
      attendace_date: attendanceDate,
      status: attendanceStatus,
      notes: notes,
    };
    try {
      await AttendanceService.createAttendance(payload);
      toast.success("Attendance Created", {
        description: `Attendance has been added successfully.`,
      });
      onSuccess();
      onCancel();
    } catch (error: any) {
      toast.error("Failed to Create Attendance", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-ghost-white/30 rounded-2xl border-t border-foreground/30 border-b border-b-foreground/30 p-6 shadow-xl"
    >
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-dar">
          Attendacnces
        </h3>
        <div className="grid grid-cols-1 gap-4 ">
          <div className="flex flex-col gap-2 w-full ">
            <SearchableSelect
              label="Employee"
              placeholder="Select an employee"
              searchPlaceholder="Search employee..."
              options={employee.map((emp) => ({
                id: emp.id,
                name: emp.name,
              }))}
              value={selectOption}
              onChange={(value) =>
                handleEmployeeChange({
                  target: { value },
                } as React.ChangeEvent<HTMLSelectElement>)
              }
            />
          </div>
          <FloatingInput
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            label="Attendance Date"
          />
          <div className="flex flex-col gap-2 w-full ">
            <label className="text-xs font-black uppercase tracking-wider text-brand-dark">
              Attendance Status
            </label>

            <div className="relative w-full bg-ghost-white border border-brand-dark/50 rounded-xl px-3 py-2.5 focus-within:border-brand-dark transition-all">
              <select
                value={attendanceStatus}
                onChange={handleStatusChange}
                className="w-full bg-transparent text-xs font-medium text-brand-dark focus:outline-none cursor-pointer"
              >
                <option value="" disabled>
                  -- Select Status --
                </option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="leave_with_permission">
                  Leave With Permission
                </option>
              </select>
            </div>
          </div>
          <FloatingInput
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            label="Notes"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-foreground/30  mt-6">
          <ButtonLoad
            isLoading={loading}
            fullWidth={false}
            loadingText="Saving..."
            icon={<Save className="w-4 h-4" />}
            type="submit"
          >
            {" "}
            Save Customer
          </ButtonLoad>
        </div>
      </div>
    </form>
  );
};
