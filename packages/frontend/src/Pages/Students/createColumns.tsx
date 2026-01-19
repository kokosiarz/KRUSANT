import React from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { StudentWithBalance } from './types';
import { TableColumn } from '@/Components/Common/Table';

export function createColumns(
  handleEditStudent: (studentId: number) => void,
  currency: string,
  showBalance?: boolean
) {
  const columns: TableColumn<StudentWithBalance>[] = [
    {
      id: 'name',
      label: 'Imię i nazwisko',
      render: (student: StudentWithBalance) => student.name,
    },
    {
      id: 'email',
      label: 'Email',
      render: (student: StudentWithBalance) => (
        <Link href={`mailto:${student.email}`} underline="hover">
          {student.email}
        </Link>
      ),
    },
    {
      id: 'phone',
      label: 'Telefon',
      render: (student: StudentWithBalance) => student.phone || '-',
    },
    {
      id: 'semester',
      label: 'Semestr',
      render: (student: StudentWithBalance) => student.semester,
    },
    {
      id: 'extraNotes',
      label: 'Notatki',
      render: (student: StudentWithBalance) => (
        <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {student.extraNotes}
        </Box>
      ),
    },
  ];

  if (showBalance) {
    columns.splice(4, 0, {
      id: 'balance',
      label: 'Saldo',
      render: (student: StudentWithBalance) => (
        <span style={{ fontWeight: 'bold', color: student.balance < 0 ? 'red' : 'inherit' }}>
          {student.balance.toFixed(2)} {currency}
        </span>
      ),
    });
  }

  columns.push({
    id: 'actions',
    label: 'Akcje',
    render: (student: StudentWithBalance) => (
      <IconButton
        size="small"
        onClick={() => handleEditStudent(student.id)}
        color="primary"
      >
        <EditIcon fontSize="small" />
      </IconButton>
    ),
  });

  return columns;
}
