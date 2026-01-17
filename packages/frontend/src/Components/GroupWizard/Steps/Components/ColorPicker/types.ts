import { EMode } from "@/Components/GroupWizard/types";

export interface StepColorProps {
  colorHex: string;
  setColorHex: (value: string) => void;
  mode: EMode
}
