import { StatusFilter } from "@/types/sale";

export interface TabConfigItem {
  id: StatusFilter;
  label: string;
}

export const FILTER_TABS_CONFIG: TabConfigItem[] = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "paid", label: "Paid" },
];
