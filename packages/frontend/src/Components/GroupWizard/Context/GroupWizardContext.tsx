import React, { createContext, ReactNode, useState } from "react";
import { EMode } from "../types";


interface GroupWizardProviderProps {
  children: ReactNode;
  mode: EMode;
  id?: number;
  stepsList: any[];
  currentStepNo?: number;
  setCurrentStepNo?: (n: number) => void;
}

export interface GroupWizardContextValue {
  mode: EMode;
  id?: number;
  currentStepNo: number;
  setCurrentStepNo: (n: number) => void;
  stepsList: any[];
}

export const GroupWizardContext =
  createContext<GroupWizardContextValue | null>(null);

export const GroupWizardProvider = ({
  children,
  mode,
  id,
  stepsList,
  currentStepNo: propCurrentStepNo,
  setCurrentStepNo: propSetCurrentStepNo,
}: GroupWizardProviderProps) => {
  const [internalStepNo, internalSetStepNo] = useState(0);
  const currentStepNo = propCurrentStepNo !== undefined ? propCurrentStepNo : internalStepNo;
  const setCurrentStepNo = propSetCurrentStepNo || internalSetStepNo;
  return (
    <GroupWizardContext.Provider value={{ mode, id, currentStepNo, setCurrentStepNo, stepsList }}>
      {children}
    </GroupWizardContext.Provider>
  );
};