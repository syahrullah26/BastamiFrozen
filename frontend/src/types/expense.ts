export interface Expense {
  id: number;
  type: string;
  amount: number;
  expense_date: string;
  notes?: string;
}
