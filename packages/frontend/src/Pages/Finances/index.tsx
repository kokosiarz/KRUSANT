import React, { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import AddPaymentDialog from './AddPaymentDialog';
import AddDebitDialog from './AddDebitDialog';
import { paymentsApi } from '@/api/endpoints/payments';
import { debitsApi } from '@/api/endpoints/debits';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CommonTable from '@/Components/Common/Table';
import PageHeaderActions from '@/Components/Common/PageHeaderActions';
import { createColumns } from './createColumns';
import { FinanceEntry } from './types';
import { useFinanceEntries } from './useFinanceEntries';


const Finances: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'payment' | 'debit'>('all');
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addDebitOpen, setAddDebitOpen] = useState(false);
  const { data: entries = [], isLoading, error } = useFinanceEntries();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const addPaymentMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      setAddPaymentOpen(false);
    },
    onError: (err) => setMutationError(err instanceof Error ? err.message : 'Nie udało się zapisać wpłaty'),
  });

  const addDebitMutation = useMutation({
    mutationFn: debitsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      setAddDebitOpen(false);
    },
    onError: (err) => setMutationError(err instanceof Error ? err.message : 'Nie udało się zapisać obciążenia'),
  });

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter(e => e.type === filter);
  }, [filter, entries]);

  const columns = useMemo(() => createColumns(), []);

  const headerButtons = (
    <PageHeaderActions>
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_e, newValue) => {
          setFilter(newValue || 'all');
        }}
        aria-label="filtr finansów"
      >
        <ToggleButton value="all" aria-label="wszystko">
          Wszystko
        </ToggleButton>
        <ToggleButton value="payment" aria-label="wpłaty">
          Wpłaty
        </ToggleButton>
        <ToggleButton value="debit" aria-label="obciążenia">
          Obciążenia
        </ToggleButton>
      </ToggleButtonGroup>
      {/* The ml:2 that used to sit on this button doubled up with the row gap,
          so the space after the toggles didn't match the space between the
          buttons. Spacing is the row's job now. */}
      <Button variant="outlined" onClick={() => setAddPaymentOpen(true)}>
        Dodaj wpłatę
      </Button>
      <Button variant="outlined" onClick={() => setAddDebitOpen(true)}>
        Dodaj obciążenie
      </Button>
    </PageHeaderActions>
  );


  const handleAddPayment = (data: any) => {
    setMutationError(null);
    addPaymentMutation.mutate(data);
  };

  const handleAddDebit = (data: any) => {
    setMutationError(null);
    addDebitMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{(error as Error).message || 'Błąd ładowania danych'}</Alert>
      </Box>
    );
  }

  return (
    <>
      <CommonTable
        columns={columns}
        rows={filteredEntries}
        tableTitle="Finanse"
        headerButtons={headerButtons}
        getRowKey={(row: FinanceEntry) => row.id}
        getRowActive={() => true}
        emptyMessage="Brak wpisów finansowych"
      />
      <AddPaymentDialog
        open={addPaymentOpen}
        onClose={() => { setAddPaymentOpen(false); setMutationError(null); }}
        onSubmit={handleAddPayment}
        submitting={addPaymentMutation.isPending}
        error={mutationError}
      />
      <AddDebitDialog
        open={addDebitOpen}
        onClose={() => { setAddDebitOpen(false); setMutationError(null); }}
        onSubmit={handleAddDebit}
        submitting={addDebitMutation.isPending}
        error={mutationError}
      />
    </>
  );
};

export default Finances;
