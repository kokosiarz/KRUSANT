export interface FinanceEntry {
  id: string; // composite: `payment-${entityId}` or `debit-${entityId}`, unique across both types
  entityId: number; // the underlying Payment/Debit row id, for mutations
  date: string; // ISO string (date for payment, dueDate for debit)
  amount: number;
  studentId: number;
  studentName: string;
  type: 'payment' | 'debit';
  // Payment fields
  comment?: string;
  proofType?: 'receipt' | 'invoice';
  fiscalized?: boolean;
  invoiceId?: number;
  // Debit fields
  dueDate?: string;
  classId?: number;
  entitlement?: string;
}
