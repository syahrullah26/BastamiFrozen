import { BatchStatus } from "@/types/purchase";

export interface TabConfigItem {
  id: BatchStatus;
  label: string;
}

export const BATCH_TAB_CONFIG: TabConfigItem[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "out-of-stock", label: "Out of Stock" },
];
