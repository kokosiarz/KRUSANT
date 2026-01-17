import { PartialType } from '@nestjs/swagger';
import { CreateDebitDto } from './create-debit.dto';

export class UpdateDebitDto extends PartialType(CreateDebitDto) {}
