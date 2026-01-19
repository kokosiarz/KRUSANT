import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React from 'react';

const ApprovalConfirmedButton: React.FC = () => (
    <Button
        size="large"
        variant="outlined"
        color="success"
        sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}
        disabled
    >
        <CheckCircleIcon sx={{ color: 'success.main' }} />
        Obecność potwierdzona
    </Button>
);

export default ApprovalConfirmedButton;
