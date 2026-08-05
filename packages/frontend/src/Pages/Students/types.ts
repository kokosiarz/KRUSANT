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
  /**
   * Start of the first scheduled class the balance can't cover. Null both when
   * the balance covers everything on the calendar and when nothing is
   * scheduled — `scheduledLessonsAhead` separates those two cases.
   */
  fundsRunOutDate?: string | null;
  daysUntilFundsRunOut?: number | null;
  scheduledLessonsCovered?: number;
  scheduledLessonsAhead?: number;
  /**
   * Outstanding przełożone (excused/rescheduled) lessons owed to the student.
   * Computed: every rescheduled marking minus every make-up lesson attended
   * in a group they don't belong to, clamped at 0.
   */
  rescheduledLessonsOwed?: number;
}
