import Button from '@mui/material/Button';
import React from 'react';

interface ApproveButtonProps {
    onClick: () => void;
}

const ApproveButton: React.FC<ApproveButtonProps> = ({ onClick }) => (
    <Button
        size="large"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={onClick}
    >
        Potwierdź obecność
    </Button>
);

export default ApproveButton;
