export enum ECostMode {
  unit = 'unit',
  total = 'total',
}

export interface StepCostProps {
  cost: number;
  setCost: (value: number) => void;
  currency: string;
  mode: ECostMode
}
