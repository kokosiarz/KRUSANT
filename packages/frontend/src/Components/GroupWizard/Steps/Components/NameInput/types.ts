import { EMode } from "@components/GroupWizard/types";

export interface StepNameProps {
  name?: string;
  setName: (name: string) => void;
  mode: EMode
}
