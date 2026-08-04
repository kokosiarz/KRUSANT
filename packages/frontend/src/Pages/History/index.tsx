import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import UndoIcon from '@mui/icons-material/Undo';
import { historyApi, HistoryEntry } from '@api/endpoints/history';

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
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const { data: entries = [], isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ['history'],
    queryFn: () => historyApi.getHistory(),
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
              sx={{
                p: 2,
                opacity: entry.undoneAt ? 0.6 : 1,
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
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default History;
