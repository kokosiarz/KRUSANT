import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

// There is no separate teacher table: a teacher *is* a user holding the
// 'teacher' role. This read-only projection exists so the teacher pickers
// (GroupWizard, class dialogs, Groups table) have a lightweight list they can
// read without being admins — creating/editing teachers goes through the
// normal /users endpoints.
@ApiTags('teachers')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'List users holding the teacher role' })
  @ApiResponse({
    status: 200,
    description: 'Returns id/name/email per teacher',
  })
  // Deliberately open to any authenticated role: non-admin teachers need this
  // to populate teacher dropdowns. Mirrors the relaxation the old standalone
  // teachers controller had.
  @Roles()
  @Get()
  async getAll() {
    const teachers = await this.usersService.findByRole(Role.Teacher);
    return teachers.map((user) => ({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
    }));
  }
}
