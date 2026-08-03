import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UnauthorizedException,
  Request,
  Response,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PassportJwtAuthGuard } from './guards/passport-jwt.guard';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';
import { AllowPendingPassword } from './allow-pending-password.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JWT_LIFETIME_MS } from './auth.constants';

@ApiTags('auth')
@Controller('auth')
export class PassportAuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  /** The single shape every auth endpoint returns a user in. */
  private toProfile(user: {
    id: number | string;
    email: string;
    name: string;
    roles?: string[];
    studentId?: number | null;
    mustChangePassword?: boolean;
  }) {
    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      roles: user.roles ?? [],
      studentId: user.studentId ?? null,
      mustChangePassword: user.mustChangePassword ?? false,
    };
  }

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
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(PassportLocalGuard)
  async login(@Request() request, @Response({ passthrough: true }) response) {
    const token = await this.authService.getToken(request.user);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: JWT_LIFETIME_MS,
    });

    return { user: this.toProfile(request.user) };
  }

  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful. Clears access token cookie.',
  })
  @Post('logout')
  @Public()
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
  // Reachable with a pending password change — the frontend needs it to know
  // that a change is what it should be showing.
  @AllowPendingPassword()
  getProfile(@Request() request) {
    return { user: this.toProfile(request.user) };
  }

  @ApiOperation({ summary: 'Change own password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed.' })
  @ApiResponse({
    status: 401,
    description: 'Current password is wrong, or not signed in.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  @UseGuards(PassportJwtAuthGuard)
  @AllowPendingPassword()
  // Same limit as login: this endpoint also takes the current password, so it
  // would otherwise be an unthrottled way to guess it.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async changePassword(@Request() request, @Body() body: ChangePasswordDto) {
    await this.usersService.changeOwnPassword(
      request.user.id,
      body.currentPassword,
      body.newPassword,
    );
    return { message: 'Hasło zostało zmienione.' };
  }

  @ApiOperation({ summary: 'Login with Google OAuth' })
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // This route initiates the Google OAuth flow
  }

  @ApiOperation({ summary: 'Google OAuth callback' })
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    let signInData: Awaited<ReturnType<AuthService['validateGoogleUser']>>;
    try {
      signInData = await this.authService.validateGoogleUser(req.user);
    } catch (error) {
      // This is a browser redirect, not an API call — throwing here would show
      // the user a raw JSON 401. Send them back to the login screen with the
      // reason instead (most often: no admin has created their account yet).
      const message =
        error instanceof UnauthorizedException
          ? error.message
          : 'Logowanie przez Google nie powiodło się.';
      return res.redirect(
        `${frontendUrl}/?authError=${encodeURIComponent(message)}`,
      );
    }

    const token = await this.authService.getToken(signInData);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: JWT_LIFETIME_MS,
    });

    // Redirect to frontend after successful login
    res.redirect(`${frontendUrl}/dashboard`);
  }
}
