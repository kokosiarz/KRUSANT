import React from 'react';

type SetError = React.Dispatch<React.SetStateAction<string | null>>;
type SetStep = React.Dispatch<React.SetStateAction<number>>;

type Params = {
  canContinue: () => boolean;
  currentStep: number;
  setError: SetError;
  setCurrentStep: SetStep;
  isTemplateNameEmpty: boolean;
  isDuplicateName: boolean;
};

export const createHandleContinue = ({
  canContinue,
  currentStep,
  setError,
  setCurrentStep,
  isTemplateNameEmpty,
  isDuplicateName,
}: Params) => () => {
  if (!canContinue()) {
    if (currentStep === 0) {
      setError('Wybierz kurs');
    } else if (currentStep === 1) {
      if (isTemplateNameEmpty) {
        setError('Nazwa szablonu jest wymagana');
      } else if (isDuplicateName) {
        setError('Szablon o tej nazwie już istnieje. Wybierz inną nazwę.');
      }
    } else if (currentStep === 5) {
      setError('Data końca musi być po dacie startu');
    }
    return;
  }
  setError(null);
  setCurrentStep((prev: number) => prev + 1);
};
