import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import UndoIcon from '@mui/icons-material/Undo';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { historyApi, HistoryEntry } from '@api/endpoints/history';
import { teachersApi } from '@api/endpoints/teachers';
import { roomsApi } from '@api/endpoints/rooms';
import { groupsApi } from '@api/endpoints/groups';
import { studentsApi } from '@api/endpoints/students';
import { useSettings } from '@/context/Settings';
import { summariseChanges, ChangeLookups } from './changeSummary';
import ChangeDetails from './ChangeDetails';

const dateTime = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const OPERATION_LABEL: Record<HistoryEntry['operation'], string> = {
  create: 'Utworzenie',
  update: 'Zmiana',
  delete: 'Usunięcie',
};

const OPERATION_COLOR: Record<
  HistoryEntry['operation'],
  'success' | 'info' | 'error'
> = {
  create: 'success',
  update: 'info',
  delete: 'error',
};

const History: React.FC = () => {
  const queryClient = useQueryClient();
  const { currency } = useSettings();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data: entries = [], isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ['history'],
    queryFn: () => historyApi.getHistory(),
  });

  // The snapshots store ids. Without these an entry reads "teacherId 4 -> 7",
  // which is a puzzle rather than an answer.
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: teachersApi.getTeachers });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: roomsApi.getRooms });
  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: groupsApi.getGroups });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: studentsApi.getStudents });

  const lookups = useMemo<ChangeLookups>(() => {
    // A record referenced here may since have been deleted, so every lookup
    // falls back to something that still identifies it rather than blank.
    const byId = <T extends { id: number }>(list: T[]) => new Map(list.map((item) => [item.id, item]));
    const teacherMap = byId(teachers);
    const roomMap = byId(rooms);
    const groupMap = byId(groups);
    const studentMap = byId(students);
    return {
      teacherName: (id) => teacherMap.get(id)?.name ?? `Nauczyciel #${id}`,
      roomName: (id) => roomMap.get(id)?.name ?? `Sala #${id}`,
      groupName: (id) => groupMap.get(id)?.name ?? `Grupa #${id}`,
      studentName: (id) => studentMap.get(id)?.name ?? `Kursant #${id}`,
      currency,
    };
  }, [teachers, rooms, groups, students, currency]);

  const toggleExpanded = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const undoMutation = useMutation({
    mutationFn: (id: number) => historyApi.undo(id),
    onSuccess: async (result) => {
      setError(null);
      setDone(result.message);
      // The undo touched a group or class, so anything showing them is stale.
      await queryClient.invalidateQueries();
    },
    onError: (err: Error) => {
      setDone(null);
      setError(err.message || 'Nie udało się cofnąć operacji');
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, width: '100%' }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" component="h1">
          Historia zmian
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
          Zapis zmian w grupach i zajęciach. Cofnąć można tylko operację, której
          rekord nikt później nie zmienił.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {done && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDone(null)}>
          {done}
        </Alert>
      )}

      {entries.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Brak zapisanych zmian.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.25}>
          {entries.map((entry) => (
            <Paper
              key={entry.id}
              variant="outlined"
              sx={{ p: 2, opacity: entry.undoneAt ? 0.6 : 1 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 1.5,
                }}
              >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}
                >
                  <Chip
                    size="small"
                    label={OPERATION_LABEL[entry.operation]}
                    color={OPERATION_COLOR[entry.operation]}
                    variant="outlined"
                  />
                  {entry.undoneAt && (
                    <Chip size="small" label="Cofnięte" variant="outlined" />
                  )}
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {entry.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {dateTime.format(new Date(entry.at))}
                  {entry.userEmail ? ` · ${entry.userEmail}` : ''}
                </Typography>
              </Box>

              {entry.undoable ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<UndoIcon />}
                  disabled={undoMutation.isPending}
                  onClick={() => undoMutation.mutate(entry.id)}
                >
                  Cofnij
                </Button>
              ) : (
                // Why it can't be undone matters more than the disabled button:
                // "already undone" and "schema changed" are different problems.
                <Tooltip title={entry.notUndoableReason ?? ''}>
                  <span>
                    <Button size="small" variant="outlined" disabled startIcon={<UndoIcon />}>
                      Cofnij
                    </Button>
                  </span>
                </Tooltip>
              )}
              </Box>

              {/* Collapsed by default: the list is scanned far more often than
                  any single entry is interrogated. */}
              <Button
                size="small"
                onClick={() => toggleExpanded(entry.id)}
                aria-expanded={expanded.has(entry.id)}
                sx={{ mt: 1, px: 1 }}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transition: (t) => t.transitions.create('transform'),
                      transform: expanded.has(entry.id) ? 'rotate(180deg)' : 'none',
                    }}
                  />
                }
              >
                {expanded.has(entry.id) ? 'Ukryj zmiany' : 'Pokaż zmiany'}
              </Button>
              <Collapse in={expanded.has(entry.id)} unmountOnExit>
                <Divider sx={{ my: 1.5 }} />
                <ChangeDetails
                  rows={summariseChanges(entry, lookups)}
                  operation={entry.operation}
                />
              </Collapse>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default History;
