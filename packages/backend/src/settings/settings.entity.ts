import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Institution name', example: 'My Academy' })
  @Column({ default: 'Institution' })
  institutionName: string;

  @ApiProperty({ description: 'Currency code or name', example: 'PLN' })
  @Column({ default: 'PLN' })
  currency: string;
}
