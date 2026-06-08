import { useState, useMemo } from "react";
import { BatchStatus } from "@/types/purchase";

interface UseBatchFilterProps<
  T extends { items?: { remaining_qty: number }[] },
> {
  data: T[];
  initialBatch?: BatchStatus;
}

export function useBatchFilter<
  T extends { items?: { remaining_qty: number }[] },
>({ data = [], initialBatch = "available" }: UseBatchFilterProps<T>) {
  const [activeBatchTab, setActiveBatchTab] =
    useState<BatchStatus>(initialBatch);

  const counts = useMemo(() => {
    return {
      all: data.length,
      available: data.filter((purchase) =>
        (purchase.items || []).some((item) => item.remaining_qty > 0),
      ).length,
      outOfStock: data.filter(
        (purchase) =>
          (purchase.items || []).length > 0 &&
          (purchase.items || []).every((item) => item.remaining_qty <= 0),
      ).length,
    };
  }, [data]);

  return {
    activeBatchTab,
    setActiveBatchTab,
    counts,
  };
}
