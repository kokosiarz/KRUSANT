import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CommonTable, { TableColumn } from '../Table';
import PageHeaderActions from '../PageHeaderActions';
import DeleteItemDialog from '../DeleteItemDialog';

export interface SimpleCrudField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select';
  required?: boolean;
  min?: number;
  helperText?: string;
  format?: (value: any) => React.ReactNode;
  options?: { value: string; label: string }[];
}

export interface SimpleCrudApi<T> {
  getAll: () => Promise<T[]>;
  create: (data: Record<string, any>) => Promise<T>;
  update: (id: number, data: Record<string, any>) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

interface SimpleCrudPageProps<T extends { id: number }> {
  title: string;
  queryKey: string;
  /** Accusative form for the delete prompt, e.g. "salę", "nauczyciela", "kurs". */
  entityLabelAccusative: string;
  fields: SimpleCrudField[];
  api: SimpleCrudApi<T>;
  getItemName: (item: T) => string;
}

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

function SimpleCrudPage<T extends { id: number }>({
  title,
  queryKey,
  entityLabelAccusative,
  fields,
  api,
  getItemName,
}: SimpleCrudPageProps<T>) {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading, error: loadError } = useQuery<T[], Error>({
    queryKey: [queryKey],
    queryFn: api.getAll,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => api.create(data),
    onSuccess: async () => {
      setFormOpen(false);
      await invalidate();
    },
    onError: (err) => setFormError(errorMessage(err, `Nie udało się utworzyć: ${title.toLowerCase()}`)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) => api.update(id, data),
    onSuccess: async () => {
      setFormOpen(false);
      await invalidate();
    },
    onError: (err) => setFormError(errorMessage(err, 'Nie udało się zapisać zmian')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.remove(id),
    onSuccess: async () => {
      setDeleteTarget(null);
      await invalidate();
    },
    onError: (err) => setDeleteError(errorMessage(err, 'Nie udało się usunąć — sprawdź, czy nie jest gdzieś używane')),
  });

  useEffect(() => {
    if (!formOpen) return;
    setFormError(null);
    if (editingItem) {
      const initial: Record<string, any> = {};
      fields.forEach((f) => {
        initial[f.key] = (editingItem as any)[f.key] ?? '';
      });
      setFormValues(initial);
    } else {
      const initial: Record<string, any> = {};
      fields.forEach((f) => {
        initial[f.key] = '';
      });
      setFormValues(initial);
    }
  }, [formOpen, editingItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const openEdit = (item: T) => {
    setEditingItem(item);
    setFormOpen(true);
  };
  const closeForm = () => {
    if (createMutation.isPending || updateMutation.isPending) return;
    setFormOpen(false);
  };

  const isFormValid = fields.every((f) => !f.required || (formValues[f.key] !== '' && formValues[f.key] !== undefined && formValues[f.key] !== null));

  const handleSubmit = () => {
    if (!isFormValid) return;
    const data: Record<string, any> = {};
    fields.forEach((f) => {
      const raw = formValues[f.key];
      data[f.key] = f.type === 'number' ? (raw === '' ? undefined : Number(raw)) : (raw === '' ? undefined : raw);
    });
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns: TableColumn<T>[] = useMemo(
    () => [
      { id: 'id', label: 'ID', render: (row) => row.id },
      ...fields.map((f) => ({
        id: f.key,
        label: f.label,
        render: (row: T) => {
          const value = (row as any)[f.key];
          if (f.format) return f.format(value);
          if (f.type === 'select') {
            return f.options?.find((o) => o.value === value)?.label ?? value ?? '—';
          }
          return value ?? '—';
        },
      })),
      {
        id: 'actions',
        label: 'Akcje',
        render: (row) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => openEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => { setDeleteTarget(row); setDeleteError(null); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [fields], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Box sx={{ width: '100%' }}>
      <CommonTable
        columns={columns}
        rows={items}
        tableTitle={title}
        headerButtons={
          <PageHeaderActions>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}>
              Dodaj
            </Button>
          </PageHeaderActions>
        }
        getRowKey={(row) => row.id}
        emptyMessage={loadError ? loadError.message : `Brak zdefiniowanych pozycji`}
      />

      <Dialog open={formOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? `Edytuj` : `Dodaj`} — {title}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            {fields.map((f) => (
              f.type === 'select' ? (
                <TextField
                  key={f.key}
                  select
                  fullWidth
                  label={f.label}
                  required={f.required}
                  value={formValues[f.key] ?? ''}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  disabled={submitting}
                  helperText={f.helperText}
                >
                  {f.options?.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  key={f.key}
                  fullWidth
                  type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : 'text'}
                  label={f.label}
                  required={f.required}
                  value={formValues[f.key] ?? ''}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  disabled={submitting}
                  helperText={f.helperText}
                  slotProps={f.type === 'number' ? { htmlInput: { min: f.min ?? 0, step: 'any' } } : undefined}
                />
              )
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} disabled={submitting}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting || !isFormValid}>
            {submitting ? <CircularProgress size={20} /> : editingItem ? 'Zapisz' : 'Utwórz'}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteItemDialog
        open={!!deleteTarget}
        itemName={deleteTarget ? `${entityLabelAccusative} „${getItemName(deleteTarget)}”` : ''}
        deleting={deleteMutation.isPending}
        error={deleteError}
        onCancel={() => { if (!deleteMutation.isPending) { setDeleteTarget(null); setDeleteError(null); } }}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </Box>
  );
}

export default SimpleCrudPage;
