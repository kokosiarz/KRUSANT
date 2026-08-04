import React from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { StudentWithBalance } from './types';
import { TableColumn } from '@/Components/Common/Table';

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * When the balance runs out, in terms of the classes actually on the calendar.
 *
 * Three distinct states share one column, so they need to read differently:
 * nothing scheduled (no prediction possible), covered through the whole
 * schedule, or a real run-out date — the last of which is urgent if it's soon.
 */
const FundsRunOut: React.FC<{ student: StudentWithBalance }> = ({ student }) => {
  const ahead = student.scheduledLessonsAhead ?? 0;

  if (ahead === 0) {
    return (
      <Tooltip title="Brak zaplanowanych zajęć w grupach tego kursanta">
        <Box component="span" sx={{ color: 'text.disabled' }}>
          —
        </Box>
      </Tooltip>
    );
  }

  if (!student.fundsRunOutDate) {
    return (
      <Tooltip title={`Saldo pokrywa wszystkie ${ahead} zaplanowanych zajęć`}>
        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
          pokryte
        </Box>
      </Tooltip>
    );
  }

  const runOut = new Date(student.fundsRunOutDate);
  const covered = student.scheduledLessonsCovered ?? 0;
  // Days come from the server, which fixed "now" when it built the forecast.
  const urgent = (student.daysUntilFundsRunOut ?? Infinity) <= 14;

  return (
    <Tooltip
      title={`Saldo pokrywa ${covered} z ${ahead} zaplanowanych zajęć. Kolejne zajęcia (${dateFormatter.format(runOut)}) nie są już pokryte.`}
    >
      <Box
        component="span"
        sx={{ color: urgent ? 'error.main' : 'warning.main', fontWeight: 600 }}
      >
        {dateFormatter.format(runOut)}
      </Box>
    </Tooltip>
  );
};

export type MoneyKind = 'payment' | 'debit';

/**
 * Compact "+" beside the balance that opens a two-item menu. A menu rather than
 * two icon buttons because the balance cell is narrow and the two actions are
 * easy to confuse at icon size — the labels say which is which.
 */
const BalanceQuickAdd: React.FC<{
  student: StudentWithBalance;
  onAddMoney: (kind: MoneyKind, student: StudentWithBalance) => void;
}> = ({ student, onAddMoney }) => {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  const pick = (kind: MoneyKind) => {
    setAnchor(null);
    onAddMoney(kind, student);
  };

  return (
    <>
      <Tooltip title="Dodaj wpłatę lub obciążenie">
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={`Dodaj wpłatę lub obciążenie dla ${student.name}`}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => pick('payment')}>
          <ListItemIcon>
            <PaymentsIcon fontSize="small" color="success" />
          </ListItemIcon>
          Dodaj wpłatę
        </MenuItem>
        <MenuItem onClick={() => pick('debit')}>
          <ListItemIcon>
            <ReceiptLongIcon fontSize="small" color="warning" />
          </ListItemIcon>
          Dodaj obciążenie
        </MenuItem>
      </Menu>
    </>
  );
};

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
  showBalance?: boolean,
  /**
   * Omitted for non-admins, which hides the delete button entirely. The backend
   * is the real gate — `DELETE /students/:id` inherits the controller's
   * class-level `@Roles(Role.Admin)` — this just avoids showing an action that
   * would only 403.
   */
  handleDeleteStudent?: (student: StudentWithBalance) => void,
  /** Opens the payment/debit dialog for one student, straight from the balance cell. */
  onAddMoney?: (kind: MoneyKind, student: StudentWithBalance) => void,
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
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: student.balance < 0 ? 'error.main' : 'inherit',
              }}
            >
              {student.balance.toFixed(2)} {currency}
            </Box>
            {/* Money is entered against a student far more often than anything
                else on this page, and doing it from Finances meant re-picking
                them from a dropdown. */}
            {onAddMoney && (
              <BalanceQuickAdd student={student} onAddMoney={onAddMoney} />
            )}
          </Stack>
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
      {
        id: 'fundsRunOutDate',
        label: (
          <HeaderWithTooltip
            label="Środki do"
            tooltip="Data pierwszych zaplanowanych zajęć, których saldo już nie pokryje. Liczone przez kolejne zaplanowane zajęcia w grupach kursanta, z uwzględnieniem jego zniżki. Wymaga zajęć wpisanych w kalendarzu — bez nich prognoza jest niedostępna."
          />
        ),
        render: (student: StudentWithBalance) => (
          <FundsRunOut student={student} />
        ),
      },
    );
  }

  columns.push({
    id: 'actions',
    label: 'Akcje',
    render: (student: StudentWithBalance) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Edytuj">
          <IconButton
            size="small"
            onClick={() => handleEditStudent(student.id)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {handleDeleteStudent && (
          <Tooltip title="Usuń">
            <IconButton
              size="small"
              onClick={() => handleDeleteStudent(student)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  });

  return columns;
}
