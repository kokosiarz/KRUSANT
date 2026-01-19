import { useQuery } from '@tanstack/react-query';

import { paymentsApi } from '@/api/endpoints/payments';
import { debitsApi } from '@/api/endpoints/debits';
import { studentsApi } from '@/api/endpoints/students';
import { FinanceEntry } from './types';

export function useFinanceEntries() {
  return useQuery({
    queryKey: ['finance-entries'],
    queryFn: async (): Promise<FinanceEntry[]> => {
      const [payments, debits, students] = await Promise.all([
        paymentsApi.getAll(),
        debitsApi.getAll(),
        studentsApi.getStudents(),
      ]);
      const studentMap = new Map<number, string>();
      (students as any[]).forEach((s: any) => {
        studentMap.set(s.id, s.name);
      });
      const paymentEntries: FinanceEntry[] = (payments as any[]).map((p: any) => ({
        id: p.id,
        date: p.date,
        amount: Number(p.amount),
        studentId: p.studentId,
        studentName: studentMap.get(p.studentId) || '',
        type: 'payment',
        comment: p.comment,
        proofType: p.proofType,
        fiscalized: p.fiscalized,
        invoiceId: p.invoiceId,
      }));
      const debitEntries: FinanceEntry[] = (debits as any[]).map((d: any) => ({
        id: d.id,
        date: d.dueDate,
        dueDate: d.dueDate,
        amount: -Math.abs(Number(d.amount)),
        studentId: d.studentId,
        studentName: studentMap.get(d.studentId) || '',
        type: 'debit',
        comment: d.comment,
        classId: d.classId,
        entitlement: d.entitlement,
      }));
      return [...paymentEntries, ...debitEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });
}
