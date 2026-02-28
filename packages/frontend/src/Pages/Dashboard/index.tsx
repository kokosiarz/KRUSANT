import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MetalPricesWidget from './Widgets/MetalPrices';
import FinancialSummaryWidget from './Widgets/FinancialSummary';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const canViewFinancials = user?.roles?.some((r) =>
    ['admin', 'teacher'].includes(r),
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={4}>
        <MetalPricesWidget />
        {canViewFinancials && <FinancialSummaryWidget />}
      </Stack>
    </Box>
  );
};

export default Dashboard;
