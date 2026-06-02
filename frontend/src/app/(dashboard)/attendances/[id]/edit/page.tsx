"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AttendanceService } from "@/services/attendanceService";
import { AttendanceRequest, Employee } from "@/types/employee";
import { EmployeeService } from "@/services/employeeService";

import { toast } from "sonner";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";

import { FloatingInput } from "@/components/ui/input/FloatingInput";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import SearchableSelect from "@/components/ui/input/select/SearchableOptions";

export default function EditAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<AttendanceRequest>({
    employee_id: 0,
    attendace_date: "",
    status: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id || id === "undefined") return;
      try {
        setLoading(true);

        const employeeData = await EmployeeService.getAllEmployees();
        setEmployees(employeeData);

        const data = await AttendanceService.getAttendance(id);
        setFormData({
          employee_id: data.employee_id,
          attendace_date: data.attendace_date,
          status: data.status,
          notes: data.notes || "",
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load attendance data");
        router.push("/attendances");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      employee_id: Number(selectedId),
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value;
    setFormData((prev) => ({
      ...prev,
      status: selectedStatus,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.status || !formData.attendace_date) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await AttendanceService.updateAttendance(id, formData);
      toast.success("Attendance Updated", {
        description: `Attendance log has been updated successfully.`,
      });
      router.push("/attendances");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to update attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2 text-zinc-500">
        <Loader2 className="h-5 w-5 animate-spin text-brand-dark" />
        <span className="text-xs font-medium font-mono">
          Loading log data...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors"
          >
            <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </button>
          <div>
            <h2 className="text-base font-black tracking-tight text-zinc-800">
              Edit Attendance Log
            </h2>
            <p className="text-[11px] text-zinc-400 font-mono">ID: #ATT-{id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <SearchableSelect
              label="Select Employee"
              placeholder="Select Employee"
              searchPlaceholder="Search Employee..."
              options={employees.map((e) => ({ id: e.id, name: e.name }))}
              value={formData.employee_id ? String(formData.employee_id) : ""}
              onChange={(val) =>
                handleEmployeeChange({
                  target: { value: val },
                } as React.ChangeEvent<HTMLSelectElement>)
              }
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 pl-0.5">
              Attendance Status
            </label>
            <select
              value={formData.status}
              onChange={handleStatusChange}
              className="w-full text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-zinc-400 transition-all cursor-pointer"
            >
              <option value="">Choose Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Sick Leave</option>
              <option value="leave_with_permission">Permitted Leave</option>
            </select>
          </div>

          <FloatingInput
            label="Attendance Date"
            type="date"
            value={formData.attendace_date}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                attendace_date: e.target.value,
              }))
            }
          />
          <FloatingInput
            label="Notes / Description"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 mt-6">
            <ButtonLoad
              type="submit"
              isLoading={submitting}
              disabled={submitting}
              icon={<Save className="w-4 h-4" />}
            >
              Save Log Changes
            </ButtonLoad>
          </div>
        </form>
      </div>
    </div>
  );
}
