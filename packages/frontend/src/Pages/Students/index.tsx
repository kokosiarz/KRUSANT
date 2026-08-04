import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CommonTable from '@/Components/Common/Table';
import PageHeaderActions from '@/Components/Common/PageHeaderActions';
import { studentsApi } from '../../api/endpoints/students';
import { groupsApi } from '../../api/endpoints/groups';
import { useMutation, useQuery } from '@tanstack/react-query';
import DeleteItemDialog from '@/Components/Common/DeleteItemDialog';
import { StudentWithBalance } from './types';
import { useAuth } from '../../hooks/useAuth';
import StudentForm from '../../Components/StudentForm';
import { useSettings } from '../../context/Settings';
import { createColumns } from './createColumns';

export const Students: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<string[]>(['active']);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingStudentId, setEditingStudentId] = useState<number | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<StudentWithBalance | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: students = [], isLoading: loading, error, refetch } = useQuery<StudentWithBalance[], Error>({
    queryKey: ['students-with-balance'],
    queryFn: studentsApi.getStudentsWithBalance,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });

  const { currency } = useSettings();

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
    // If 'all' is selected or no filters, show all students
    if (filters.includes('all') || filters.length === 0) {
      return students;
    }
    // Apply active filter
    if (filters.includes('active')) {
      result = result.filter(student => student.active);
    }
    if (filters.includes('mine')) {
      result = result.filter(student => myStudentIds.has(student.id));
    }
    return result;
  }, [students, filters, myStudentIds]);

  const handleFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilters: string[]) => {
    // If no filters selected, default to 'all'
    if (newFilters.length === 0) {
      setFilters(['all']);
      return;
    }
    
    // If 'all' was just added (not previously selected), clear other filters
    if (newFilters.includes('all') && !filters.includes('all')) {
      setFilters(['all']);
      return;
    }
    
    // If selecting a specific filter while 'all' is active, remove 'all'
    if (newFilters.includes('all') && newFilters.length > 1) {
      setFilters(newFilters.filter(f => f !== 'all'));
      return;
    }
    
    setFilters(newFilters);
  };

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
      ),
    [handleEditStudent, currency, isAdmin]
  );

  const headerButtons = (
    <PageHeaderActions>
      <ToggleButtonGroup
        value={filters}
        onChange={handleFilterChange}
        aria-label="student filter"
      >
        <ToggleButton value="all" aria-label="Wszyscy kursanci">
          Wszyscy
        </ToggleButton>
        <ToggleButton value="active" aria-label="Aktywni kursanci">
          Aktywni
        </ToggleButton>
        <ToggleButton value="mine" aria-label="Moi kursanci">
          Moi
        </ToggleButton>
      </ToggleButtonGroup>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddStudent}
      >
        Dodaj kursanta
      </Button>
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
    )
  );
};

export default Students;
