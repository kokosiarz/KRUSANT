import { Body, Controller, Param, ParseIntPipe, Get, Post, Patch, Delete, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(PassportJwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    const user = await this.usersService.create({
      email: body.email,
      password: body.password,
      roles: body.roles,
      teacherId: body.teacherId,
      studentId: body.studentId,
    });
    // Don't return password hash
    const { passwordHash, ...result } = user;
    return result;
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })
  @Roles(Role.Admin)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    const user = await this.usersService.update(id, body);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  @ApiOperation({ summary: 'Reset user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset' })
  @Roles(Role.Admin)
  @Post(':id/reset-password')
  async resetPassword(@Param('id', ParseIntPipe) id: number, @Body() body: ResetPasswordDto) {
    await this.usersService.setPassword(id, body.newPassword);
    return { message: 'Password reset successfully' };
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
