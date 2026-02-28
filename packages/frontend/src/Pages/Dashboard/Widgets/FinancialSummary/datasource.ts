import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../../../../api/endpoints/students';
import { StudentWithBalance } from '../../../Students/types';

export const useStudentsWithBalance = () => {
  return useQuery<StudentWithBalance[], Error>({
    queryKey: ['students-with-balance'],
    queryFn: studentsApi.getStudentsWithBalance,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDebtorStudents = () => {
  const query = useStudentsWithBalance();
  const debtors = (query.data ?? [])
    .filter((s) => s.balance < 0)
    .sort((a, b) => a.balance - b.balance); // worst debt first

  const totalDebt = debtors.reduce((sum, s) => sum + s.balance, 0);

  return { ...query, debtors, totalDebt };
};
