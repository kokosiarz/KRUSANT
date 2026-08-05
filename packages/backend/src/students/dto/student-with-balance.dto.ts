import { ApiProperty } from '@nestjs/swagger';

export class StudentWithBalanceDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  discount?: number;

  @ApiProperty()
  semester: string;

  @ApiProperty()
  extraNotes: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  balance: number;

  @ApiProperty({
    description:
      "Effective per-lesson rate used to estimate lessonsLeft (the student's active group's unitCost, with discount applied)",
  })
  unitCost?: number | null;

  @ApiProperty({
    description:
      'Estimated number of lessons still covered by the current balance (balance / unitCost, floored). Null when no rate could be determined.',
  })
  lessonsLeft?: number | null;

  @ApiProperty({
    description:
      'Start time of the first scheduled upcoming class the balance can no longer cover — i.e. when the money runs out. Null when the balance covers every scheduled class, or when nothing is scheduled.',
    nullable: true,
  })
  fundsRunOutDate?: string | null;

  @ApiProperty({
    description:
      'Whole days from now until fundsRunOutDate. Null when there is no run-out date.',
    nullable: true,
  })
  daysUntilFundsRunOut?: number | null;

  @ApiProperty({
    description:
      'How many of the upcoming scheduled classes the current balance covers.',
  })
  scheduledLessonsCovered?: number;

  @ApiProperty({
    description:
      'Total upcoming scheduled classes across the groups this student belongs to. 0 means nothing is on the calendar, so no prediction is possible.',
  })
  scheduledLessonsAhead?: number;

  @ApiProperty({
    description:
      "Outstanding przełożone (excused/rescheduled) lessons owed to the student. Computed, not explicitly linked: every 'rescheduled' marking minus every time the student was marked present in a class belonging to a group they don't belong to (a make-up lesson elsewhere), clamped at 0.",
  })
  rescheduledLessonsOwed: number;
}
