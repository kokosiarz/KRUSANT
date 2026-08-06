import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CommonTable from '@/Components/Common/Table';
import PageHeaderActions from '@/Components/Common/PageHeaderActions';
import AddFab from '@/Components/Common/AddFab';
import { studentsApi } from '../../api/endpoints/students';
import { groupsApi } from '../../api/endpoints/groups';
import { useMutation, useQuery } from '@tanstack/react-query';
import DeleteItemDialog from '@/Components/Common/DeleteItemDialog';
import { StudentWithBalance } from './types';
import { useAuth } from '../../hooks/useAuth';
import StudentForm from '../../Components/StudentForm';
import { useSettings } from '../../context/Settings';
import { createColumns, MoneyKind } from './createColumns';
import AddPaymentDialog from '../Finances/AddPaymentDialog';
import AddDebitDialog from '../Finances/AddDebitDialog';
import { paymentsApi } from '@api/endpoints/payments';
import { debitsApi } from '@api/endpoints/debits';

export const Students: React.FC = () => {
  const { user } = useAuth();
  // Two independent controls, mirroring the calendar's toolbar: an exclusive
  // scope, plus "mine" as a separate switch that narrows whichever scope is on.
  // They used to be one three-button group where "Wszyscy" cleared the others
  // and the rest combined — the same states, but the grouping implied they were
  // alternatives to each other.
  const [scope, setScope] = useState<'all' | 'active'>('active');
  const [onlyMine, setOnlyMine] = useState(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingStudentId, setEditingStudentId] = useState<number | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<StudentWithBalance | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [moneyTarget, setMoneyTarget] = useState<{
    kind: MoneyKind;
    student: StudentWithBalance;
  } | null>(null);
  const [moneyError, setMoneyError] = useState<string | null>(null);

  const { data: students = [], isLoading: loading, error, refetch } = useQuery<StudentWithBalance[], Error>({
    queryKey: ['students-with-balance'],
    queryFn: studentsApi.getStudentsWithBalance,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });

  const { currency } = useSettings();
  const isTeacher = (user?.roles ?? []).some((role) => role.toLowerCase() === 'teacher');

  // Students who belong to any group taught by the current user.
  const myStudentIds = useMemo(() => {
    if (!user?.id) return new Set<number>();
    const myId = Number(user.id);
    const ids = groups
      .filter((group) => group.teacherId === myId)
      .flatMap((group) => group.studentIds.map((id) => Number(id)));
    return new Set(ids);
  }, [groups, user?.id]);

  const filteredStudents = useMemo(() => {
    let result = students;
    if (scope === 'active') result = result.filter((student) => student.active);
    if (onlyMine) result = result.filter((student) => myStudentIds.has(student.id));
    return result;
  }, [students, scope, onlyMine, myStudentIds]);

  const handleAddStudent = () => {
    setEditingStudentId(undefined);
    setFormOpen(true);
  };

  const handleEditStudent = React.useCallback((studentId: number) => {
    setEditingStudentId(studentId);
    setFormOpen(true);
  }, []);

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingStudentId(undefined);
  };

  const handleFormSuccess = () => {
    refetch();
  };


  const isAdmin = !!user?.roles?.includes('admin');

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentsApi.deleteStudent(id),
    onSuccess: async () => {
      setDeleteTarget(null);
      setDeleteError(null);
      await refetch();
    },
    onError: (err: Error) =>
      setDeleteError(err.message || 'Nie udało się usunąć kursanta'),
  });

  const addMoneyMutation = useMutation({
    mutationFn: async (payload: { kind: MoneyKind; data: any }) =>
      payload.kind === 'payment'
        ? paymentsApi.create(payload.data)
        : debitsApi.create(payload.data),
    onSuccess: async () => {
      setMoneyTarget(null);
      setMoneyError(null);
      await refetch();
    },
    onError: (err: Error) =>
      setMoneyError(err.message || 'Nie udało się zapisać'),
  });

  const columns = useMemo(
    () =>
      createColumns(
        handleEditStudent,
        currency,
        true,
        // Only admins get the delete action; DELETE /students/:id is admin-only
        // on the server, so showing it to anyone else would just 403.
        isAdmin
          ? (student: StudentWithBalance) => {
              setDeleteError(null);
              setDeleteTarget(student);
            }
          : undefined,
        (kind, student) => {
          setMoneyError(null);
          setMoneyTarget({ kind, student });
        },
      ),
    [handleEditStudent, currency, isAdmin]
  );

  const headerButtons = (
    <PageHeaderActions>
      <ToggleButtonGroup
        exclusive
        value={scope}
        onChange={(_e, value: 'all' | 'active' | null) => value && setScope(value)}
        aria-label="Zakres listy kursantów"
      >
        <ToggleButton value="all" aria-label="Wszyscy kursanci">
          Wszyscy
        </ToggleButton>
        <ToggleButton value="active" aria-label="Aktywni kursanci">
          Aktywni
        </ToggleButton>
      </ToggleButtonGroup>
      {/* Its own switch, not a third option in the group above — it narrows
          whichever scope is selected rather than replacing it. Same shape as
          "Moje" on the calendar. Hidden for anyone who doesn't teach, since
          they have no groups and it could only ever empty the list. */}
      {isTeacher && (
        <ToggleButton
          value="mine"
          selected={onlyMine}
          onChange={() => setOnlyMine((prev) => !prev)}
          aria-label="Moi kursanci"
        >
          Moi
        </ToggleButton>
      )}
    </PageHeaderActions>
  );

  const dialogs = (
    <>
      <StudentForm
        open={formOpen}
        onClose={handleFormClose}
        studentId={editingStudentId}
        onSuccess={handleFormSuccess}
      />
      <DeleteItemDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.name}
        deleting={deleteMutation.isPending}
        error={deleteError}
        onCancel={() => {
          if (deleteMutation.isPending) return;
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
      <AddPaymentDialog
        open={moneyTarget?.kind === 'payment'}
        onClose={() => setMoneyTarget(null)}
        submitting={addMoneyMutation.isPending}
        error={moneyError}
        lockedStudentId={moneyTarget?.student.id}
        lockedStudentName={moneyTarget?.student.name}
        onSubmit={(data) => addMoneyMutation.mutate({ kind: 'payment', data })}
      />
      <AddDebitDialog
        open={moneyTarget?.kind === 'debit'}
        onClose={() => setMoneyTarget(null)}
        submitting={addMoneyMutation.isPending}
        error={moneyError}
        lockedStudentId={moneyTarget?.student.id}
        lockedStudentName={moneyTarget?.student.name}
        onSubmit={(data) => addMoneyMutation.mutate({ kind: 'debit', data })}
      />
    </>
  );

  return (
    loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    ) : error ? (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error.message}</Alert>
      </Box>
    ) : (
      <>
        <CommonTable
          columns={columns}
          rows={filteredStudents}
          tableTitle="Kursanci"
          dialogs={dialogs}
          headerButtons={headerButtons}
          getRowKey={(row: StudentWithBalance) => row.id}
          getRowActive={(row: StudentWithBalance) => row.active}
          emptyMessage="Nie znaleziono kursantów"
        />
        {/* Same entry point as the calendar's, in the same place. */}
        <AddFab onClick={handleAddStudent} label="Dodaj kursanta" />
      </>
    )
  );
};

export default Students;
