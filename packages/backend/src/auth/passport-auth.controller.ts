import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Response,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PassportJwtAuthGuard } from './guards/passport-jwt.guard';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class PassportAuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'teacher@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Login successful. Returns user data and sets access token cookie.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  async login(@Request() request, @Response({ passthrough: true }) response) {
    const token = await this.authService.getToken(request.user);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return {
      user: {
        id: request.user.id.toString(),
        email: request.user.email,
        name: request.user.name,
        roles: request.user.roles ?? [],
        teacherId: request.user.teacherId ?? null,
        studentId: request.user.studentId ?? null,
      },
    };
  }

  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful. Clears access token cookie.',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Response({ passthrough: true }) response) {
    response.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user profile.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT token required.',
  })
  @Get('profile')
  @UseGuards(PassportJwtAuthGuard)
  getProfile(@Request() request) {
    return {
      user: {
        id: request.user.id.toString(),
        email: request.user.email,
        name: request.user.name,
        roles: request.user.roles ?? [],
        teacherId: request.user.teacherId ?? null,
        studentId: request.user.studentId ?? null,
      },
    };
  }

  @ApiOperation({ summary: 'Backfill Users from Teachers (dev only)' })
  @ApiResponse({ status: 200, description: 'Backfill executed' })
  @Post('backfill-teachers')
  async backfillTeachers() {
    return this.authService.backfillUsersFromTeachers();
  }

  @ApiOperation({ summary: 'Reset user password by email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'teacher@example.com' },
        newPassword: { type: 'string', example: 'newpassword123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }

  @ApiOperation({ summary: 'Login with Google OAuth' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // This route initiates the Google OAuth flow
  }

  @ApiOperation({ summary: 'Google OAuth callback' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const signInData = await this.authService.validateGoogleUser(req.user);
    const token = await this.authService.getToken(signInData);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Redirect to frontend after successful login
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/dashboard`);
  }
}
