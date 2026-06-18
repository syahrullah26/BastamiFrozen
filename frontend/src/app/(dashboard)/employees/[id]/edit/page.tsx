"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { EmployeeService } from "@/services/employeeService";
import { Employee, EmployeeRequest } from "@/types/employee";
import { toast } from "sonner";
import axios from "axios";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { ArrowLeft, Save } from "lucide-react";

export default function EmployeeEditPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<EmployeeRequest>({
    name: "",
    salary: 0,
    status: "active",
  });

  useEffect(() => {
    if (!employeeId || employeeId === "undefined") return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await EmployeeService.getEmployee(employeeId);
        setEmployee(data);
        setFormData({
          name: data.name,
          salary: data.salary,
          status: data.status,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Unauthorized");
        }
        toast.error("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: EmployeeRequest = {
      name: formData.name,
      salary: formData.salary,
      status: formData.status,
    };

    if (!payload.name || !payload.salary) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields.",
      });
      return;
    }
    try {
      setLoading(true);
      await EmployeeService.updateEmployee(employeeId, payload);
      toast.success("Employee updated successfully", {
        description: `${payload.name} has been updated successfully.`,
      });
      router.push("/employees");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 w-full border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="group p-2 -ml-2 text-zinc-500 hover:text-brand-dark rounded-lg hover:bg-zinc-50 transition-all duration-200 cursor-pointer flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>
          <h1 className="text-sm font-semibold text-brand-dark">
            Back to List
          </h1>
        </div>
        <div className="flex items-center gap-2"></div>
      </div>

      <div className="flex items-start gap-2 w-full space-y-4">
        <span className="text-md font-bold tracking-tight text-brand-dark">
          Edit Employee{" "}
          <span className="text-primary-brand uppercase">
            {" "}
            #{employee?.name}
          </span>
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-ghost-white/30 rounded-2xl border-t border-zinc-200 border-b border-b-zinc-200 p-6 shadow-xl"
      >
        <div className="grid grid-cols-1 gap-4">
          <FloatingInput
            label="Employee Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <FloatingInput
            label="Employee Salary"
            value={formData.salary}
            type="number"
            onChange={(e) =>
              setFormData({ ...formData, salary: parseFloat(e.target.value) })
            }
          />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200  mt-6 ">
          <ButtonLoad
            isLoading={loading}
            fullWidth={false}
            loadingText="Updating..."
            icon={<Save className="w-4 h-4" />}
            type="submit"
          >
            {""}
            Update
          </ButtonLoad>
        </div>
      </form>
    </div>
  );
}
