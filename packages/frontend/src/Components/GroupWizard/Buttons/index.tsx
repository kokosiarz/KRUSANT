import React from 'react';
import { Box, Button } from '@mui/material';
import { groupTemplateFormStyles } from '../styles';

import { EStep } from '../Steps/types';

interface Props {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  onSave: () => void;
  canContinue: boolean;
  stepKey?: string;
}

const WizardButtons: React.FC<Props> = ({
  currentStep,
  totalSteps,
  onBack,
  onContinue,
  onSkip,
  onSave,
  canContinue,
  stepKey,
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  const canGoBack = currentStep > 0;
  const canSkip = currentStep > 1 && stepKey !== EStep.Summary;

  return (
    <Box sx={groupTemplateFormStyles.buttonColumn}>
      {isLastStep || stepKey === EStep.Summary ? (
        <Button
          variant="contained"
          fullWidth
          onClick={onSave}
          sx={groupTemplateFormStyles.primaryButton}
        >
          Zapisz i zakończ
        </Button>
      ) : (
        <Button
          variant="contained"
          fullWidth
          onClick={onContinue}
          sx={groupTemplateFormStyles.primaryButton}
          disabled={!canContinue}
        >
          Kontynuuj
        </Button>
      )}

      <Box sx={groupTemplateFormStyles.secondaryRow}>
        {canGoBack && (
          <Button variant="outlined" fullWidth onClick={onBack}>
            Wstecz
          </Button>
        )}
        {canSkip && (
          <Button variant="outlined" fullWidth onClick={onSkip} disabled={!canContinue}>
            Pomiń
          </Button>
        )}
        {/* No secondary save button in summary step */}
      </Box>
    </Box>
  );
};

export default WizardButtons;
