import React from 'react';
import { GroupWizardData } from '../types';

type SetFormData = React.Dispatch<React.SetStateAction<GroupWizardData>>;
type SetError = React.Dispatch<React.SetStateAction<string | null>>;
type SetStep = React.Dispatch<React.SetStateAction<number>>;

type Params = {
  setFormData: SetFormData;
  setError: SetError;
  setCurrentStep: SetStep;
  onClose: () => void;
};

export const createHandleClose = ({ setFormData, setError, setCurrentStep, onClose }: Params) => () => {
  setFormData({} as GroupWizardData);
  setError(null);
  setCurrentStep(0);
  onClose();
};
