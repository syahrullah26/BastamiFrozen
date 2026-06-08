import { useState, useMemo } from "react";
import { StatusFilter } from "@/types/sale";

interface UseStatusFilterProps<T extends { status: string }> {
  data: T[];
  initialStatus?: StatusFilter;
}

export function useStatusFilter<T extends { status: string }>({
  data = [],
  initialStatus = "unpaid",
}: UseStatusFilterProps<T>) {
  const [activeTab, setActiveTab] = useState<StatusFilter>(initialStatus);

  const counts = useMemo(() => {
    return {
      all: data.length,
      paid: data.filter((item) => item.status === "paid").length,
      unpaid: data.filter((item) => item.status === "unpaid").length,
    };
  }, [data]);

  return {
    activeTab,
    setActiveTab,
    counts,
  };
}
