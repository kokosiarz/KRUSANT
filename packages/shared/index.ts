// Example shared type
export interface StudentDTO {
  id: number;
  name: string;
  active: boolean;
  balance: number;
}

// Example shared utility
export function formatCurrency(amount: number, currency: string = 'PLN'): string {
  return `${amount.toFixed(2)} ${currency}`;
}
