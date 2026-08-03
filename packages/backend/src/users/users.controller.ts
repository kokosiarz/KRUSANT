import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService, IssuedCredentials } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';
import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(PassportJwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Emails the temporary password, and reports back what happened. When the
   * send fails the plaintext comes back in the response so the admin can pass
   * it on by hand — the account is already created either way, and this is the
   * only moment the password can still be read.
   */
  private async deliver(issued: IssuedCredentials) {
    const { user, tempPassword, expiresAt } = issued;
    const result = await this.mailService.sendAccountCreated({
      email: user.email,
      name: user.name,
      tempPassword,
      expiresAt,
    });
    const { passwordHash, ...safeUser } = user;
    return {
      user: safeUser,
      emailSent: result.sent,
      emailError: result.error ?? null,
      tempPasswordExpiresAt: expiresAt.toISOString(),
      // Withheld once the email is on its way: if it arrived, the admin has no
      // business seeing someone else's password.
      tempPassword: result.sent ? null : tempPassword,
    };
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  @Roles(Role.Admin)
  @Get()
  async getAll() {
    const users = await this.usersService.findAll();
    // Don't return password hashes
    return users.map(({ passwordHash, ...user }) => user);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns user' })
  @Roles(Role.Admin)
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
  @Roles(Role.Admin)
  @Post()
  async create(@Body() body: CreateUserDto) {
    // Admins don't choose passwords: every account starts on a generated
    // temporary one that the owner has to replace within 24h.
    return this.deliver(
      await this.usersService.createWithTempPassword({
        email: body.email,
        name: body.name,
        roles: body.roles,
        studentId: body.studentId,
      }),
    );
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })
  @Roles(Role.Admin)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, body);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  @ApiOperation({
    summary: 'Issue a fresh temporary password and email it to the user',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Temporary password issued' })
  @Roles(Role.Admin)
  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  // No body: the admin can't pick the password here either. This is also the
  // way back in for someone whose previous temporary password expired.
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.deliver(await this.usersService.issueTempPassword(id));
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
