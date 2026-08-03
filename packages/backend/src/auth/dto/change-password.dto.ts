import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH } from '../../users/users.constants';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The password the user currently signs in with',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: `New password, at least ${MIN_PASSWORD_LENGTH} characters`,
  })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Nowe hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`,
  })
  newPassword: string;
}
