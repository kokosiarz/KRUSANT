import React from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { StudentWithBalance } from './types';
import { TableColumn } from '@/Components/Common/Table';

const HeaderWithTooltip: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
    <span>{label}</span>
    <Tooltip title={tooltip}>
      <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
    </Tooltip>
  </Stack>
);

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
    columns.splice(
      4,
      0,
      {
        id: 'balance',
        label: (
          <HeaderWithTooltip
            label="Saldo"
            tooltip="Suma wpłat minus suma obciążeń (naliczonych za odbyte zajęcia)."
          />
        ),
        render: (student: StudentWithBalance) => (
          <span style={{ fontWeight: 'bold', color: student.balance < 0 ? 'red' : 'inherit' }}>
            {student.balance.toFixed(2)} {currency}
          </span>
        ),
      },
      {
        id: 'lessonsLeft',
        label: (
          <HeaderWithTooltip
            label="Pozostałe zajęcia (szac.)"
            tooltip="Saldo podzielone przez koszt jednych zajęć w aktywnej grupie kursanta (koszt za godzinę × długość zajęć, ze zniżką). Brak wartości oznacza, że kursant nie należy do żadnej aktywnej grupy albo grupa nie ma ustawionej długości zajęć."
          />
        ),
        render: (student: StudentWithBalance) =>
          student.lessonsLeft == null ? (
            '-'
          ) : (
            <span style={{ color: student.lessonsLeft <= 0 ? 'red' : 'inherit' }}>
              {student.lessonsLeft}
            </span>
          ),
      },
    );
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
