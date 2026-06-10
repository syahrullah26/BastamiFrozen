import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  present: {
    label: "Present",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
  },
  absent: {
    label: "Absent",
    className: "bg-rose-50 text-rose-700 border-rose-200/60",
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
  },
  leave: {
    label: "Sick Leave",
    className: "bg-amber-50 text-amber-700 border-amber-200/60",
    icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
  },
  leave_with_permission: {
    label: "Permitted Leave",
    className: "bg-sky-50 text-sky-700 border-sky-200/60",
    icon: <Clock className="w-3.5 h-3.5 text-sky-600" />,
  },
};

