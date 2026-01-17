import { Body, Controller, Param, Get, Post, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  @Get()
  async getAll() {
    return await this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns user' })
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.usersService.findById(+id);
  }

  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
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
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return await this.usersService.update(+id, body);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.remove(+id);
    return { message: 'User deleted successfully' };
  }
}
