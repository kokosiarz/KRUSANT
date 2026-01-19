export interface Payment {
  date: string;
  amount: number;
  comment: string;
}

export interface Class {
  date: string;
  cost: number;
  type: string;
  semester: string;
  teacher: number | string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  payments: Payment[];
  classes: Class[];
  customRate: number | null;
  discount: number | null;
  semester: string;
  extraNotes: string;
  groupId: number;
  active: boolean;
}

export interface StudentWithBalance {
  id: number;
  name: string;
  email: string;
  phone?: string;
  customRate?: number;
  discount?: number;
  semester: string;
  extraNotes: string;
  active: boolean;
  balance: number;
}
