import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import MetalPricesWidget from './Widgets/MetalPrices';
import FinancialSummaryWidget from './Widgets/FinancialSummary';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const hasAnyRole = !!user?.roles?.length;
  const canViewFinancials = user?.roles?.some((r) =>
    ['admin', 'teacher'].includes(r),
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={4}>
        {!hasAnyRole && (
          <Alert severity="info">
            Twoje konto nie ma jeszcze przypisanej roli. Poproś administratora
            o nadanie uprawnień, aby uzyskać dostęp do pozostałych funkcji
            aplikacji.
          </Alert>
        )}
        <MetalPricesWidget />
        {canViewFinancials && <FinancialSummaryWidget />}
      </Stack>
    </Box>
  );
};

export default Dashboard;
