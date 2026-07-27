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
  customRate?: number;

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

  @ApiProperty({ description: 'Effective per-lesson rate used to estimate lessonsLeft (customRate, or the active group\'s unitCost, with discount applied)' })
  unitCost?: number | null;

  @ApiProperty({ description: 'Estimated number of lessons still covered by the current balance (balance / unitCost, floored). Null when no rate could be determined.' })
  lessonsLeft?: number | null;
}
