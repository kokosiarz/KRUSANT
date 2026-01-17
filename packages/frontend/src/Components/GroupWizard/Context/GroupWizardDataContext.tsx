import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GroupData, TemplateData } from '../types';
import { GroupWizardData } from '../types';
import { buildInitialFormData } from '../helpers/buildInitialFormData';

interface GroupWizardDataContextProps {
  formData: GroupWizardData;
  setFormData: React.Dispatch<React.SetStateAction<GroupWizardData>>;
  resetFormData: () => void;
}

export const GroupWizardDataContext = createContext<GroupWizardDataContextProps>({} as GroupWizardDataContextProps);

export const useGroupWizardData = () => {
  const ctx = useContext(GroupWizardDataContext);
  if (!ctx) throw new Error('useGroupWizardData must be used within a GroupWizardDataContext.Provider');
  return ctx;
};

export const GroupWizardDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<GroupWizardData>(buildInitialFormData());
  const resetFormData = () => setFormData(buildInitialFormData());

  return (
    <GroupWizardDataContext.Provider value={{ formData, setFormData, resetFormData }}>
      {children}
    </GroupWizardDataContext.Provider>
  );
};
