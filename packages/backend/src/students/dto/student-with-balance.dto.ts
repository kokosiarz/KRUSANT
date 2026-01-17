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
}
