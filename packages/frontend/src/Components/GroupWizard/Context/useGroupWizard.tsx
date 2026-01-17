import { useContext } from "react";
import { GroupWizardContext } from "./GroupWizardContext";

export function useGroupWizard() {
  const context = useContext(GroupWizardContext);

  if (!context) {
    throw new Error(
      "useGroupWizard must be used inside GroupWizardProvider"
    );
  }

  return context;
}