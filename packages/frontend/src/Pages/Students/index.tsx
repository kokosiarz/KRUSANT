import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CommonTable from '@/Components/Common/Table';
import { studentsApi } from '../../api/endpoints/students';
import { useQuery } from '@tanstack/react-query';
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

  const { data: students = [], isLoading: loading, error, refetch } = useQuery<StudentWithBalance[], Error>({
    queryKey: ['students-with-balance'],
    queryFn: studentsApi.getStudentsWithBalance,
  });

  const { currency } = useSettings();

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
    // The 'mine' filter is skipped for StudentWithBalance (no classes info)
    return result;
  }, [students, filters]);

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


  const columns = useMemo(
    () => createColumns(handleEditStudent, currency, true),
    [handleEditStudent, currency]
  );

  const headerButtons = (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <ToggleButtonGroup
        value={filters}
        onChange={handleFilterChange}
        aria-label="student filter"
        size="small"
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
    </Box>
  );

  const dialogs = (
    <StudentForm
      open={formOpen}
      onClose={handleFormClose}
      studentId={editingStudentId}
      onSuccess={handleFormSuccess}
    />
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
