import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'New password for the user',
    example: 'newPassword123',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
