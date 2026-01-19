import React, { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import AddPaymentDialog from './AddPaymentDialog';
import AddDebitDialog from './AddDebitDialog';
import { paymentsApi } from '@/api/endpoints/payments';
import { debitsApi } from '@/api/endpoints/debits';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CommonTable from '@/Components/Common/Table';
import { createColumns } from './createColumns';
import { FinanceEntry } from './types';
import { useFinanceEntries } from './useFinanceEntries';


const Finances: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'payment' | 'debit'>('all');
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addDebitOpen, setAddDebitOpen] = useState(false);
  const { data: entries = [], isLoading, error, refetch } = useFinanceEntries();
  const queryClient = useQueryClient();

  const addPaymentMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      setAddPaymentOpen(false);
    },
  });

  const addDebitMutation = useMutation({
    mutationFn: debitsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      setAddDebitOpen(false);
    },
  });

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter(e => e.type === filter);
  }, [filter, entries]);

  const columns = useMemo(() => createColumns(), []);

  const headerButtons = (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_e, newValue) => {
          setFilter(newValue || 'all');
        }}
        aria-label="filtr finansów"
        size="small"
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
      <Button variant="outlined" onClick={() => setAddPaymentOpen(true)} sx={{ ml: 2 }}>
        Dodaj wpłatę
      </Button>
      <Button variant="outlined" onClick={() => setAddDebitOpen(true)}>
        Dodaj obciążenie
      </Button>
    </Box>
  );


  if (isLoading) return <div>Ładowanie danych...</div>;
  if (error) return <div style={{ color: 'red' }}>{(error as Error).message || 'Błąd ładowania danych'}</div>;

  const handleAddPayment = (data: any) => {
    addPaymentMutation.mutate(data);
  };

  const handleAddDebit = (data: any) => {
    addDebitMutation.mutate(data);
  };

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
      <AddPaymentDialog open={addPaymentOpen} onClose={() => setAddPaymentOpen(false)} onSubmit={handleAddPayment} />
      <AddDebitDialog open={addDebitOpen} onClose={() => setAddDebitOpen(false)} onSubmit={handleAddDebit} />
    </>
  );
};

export default Finances;
