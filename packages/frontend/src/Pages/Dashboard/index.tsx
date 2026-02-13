import React from 'react';
import Box from '@mui/material/Box';
import MetalPricesWidget from './Widgets/MetalPrices';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <MetalPricesWidget />
    </Box>
  );
};

export default Dashboard;
