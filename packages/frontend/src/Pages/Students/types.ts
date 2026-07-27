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
  discount?: number;
  semester: string;
  extraNotes: string;
  active: boolean;
  balance: number;
  unitCost?: number | null;
  lessonsLeft?: number | null;
}
