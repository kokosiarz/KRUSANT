import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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

  const firstName = (user?.name || user?.email || '').split(/[\s@]/)[0];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        {/* The page opened straight into widgets with no heading, which read as
            an unfinished screen rather than a landing page. */}
        <Box>
          <Typography variant="h4" component="h1">
            {firstName ? `Witaj, ${firstName}` : 'Pulpit'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {new Intl.DateTimeFormat('pl-PL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date())}
          </Typography>
        </Box>

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
