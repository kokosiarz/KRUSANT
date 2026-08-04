import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// Named explicitly: without them TS can't write the inferred return types of
// the two "options" endpoints in a portable way (TS2883).
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import { Throttle } from '@nestjs/throttler';
import { PasskeyService } from './passkey.service';
import { AuthService } from '../auth.service';
import { PassportJwtAuthGuard } from '../guards/passport-jwt.guard';
import { Public } from '../public.decorator';
import { JWT_LIFETIME_MS } from '../auth.constants';

@ApiTags('passkeys')
@Controller('auth/passkey')
export class PasskeyController {
  constructor(
    private readonly passkeys: PasskeyService,
    private readonly authService: AuthService,
  ) {}

  // ------------------------------------------------------- managing own keys

  @ApiOperation({ summary: "List the signed-in user's passkeys" })
  @Get()
  @UseGuards(PassportJwtAuthGuard)
  async list(@Request() request) {
    return this.passkeys.listForUser(Number(request.user.id));
  }

  @ApiOperation({ summary: 'Remove one of your own passkeys' })
  @Delete(':id')
  @UseGuards(PassportJwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() request) {
    await this.passkeys.remove(Number(request.user.id), id);
    return { message: 'Klucz został usunięty.' };
  }

  // ------------------------------------------------------------- registration

  @ApiOperation({
    summary: 'Begin registering a passkey for the signed-in user',
  })
  @Post('register/options')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PassportJwtAuthGuard)
  async registerOptions(@Request() request): Promise<{
    handle: string;
    options: PublicKeyCredentialCreationOptionsJSON;
  }> {
    return this.passkeys.startRegistration({
      id: Number(request.user.id),
      email: request.user.email,
      name: request.user.name,
    });
  }

  @ApiOperation({ summary: 'Complete passkey registration' })
  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PassportJwtAuthGuard)
  async registerVerify(
    @Request() request,
    @Body() body: { handle: string; response: any; label?: string },
  ) {
    return this.passkeys.finishRegistration(
      { id: Number(request.user.id) },
      body.handle,
      body.response,
      body.label ?? '',
    );
  }

  // ----------------------------------------------------------- authentication

  @ApiOperation({ summary: 'Begin passkey sign-in (no username needed)' })
  @ApiResponse({ status: 200, description: 'Challenge and WebAuthn options' })
  @Post('login/options')
  @HttpCode(HttpStatus.OK)
  @Public()
  // Same limit as password login: this is an unauthenticated entry point.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async loginOptions(): Promise<{
    handle: string;
    options: PublicKeyCredentialRequestOptionsJSON;
  }> {
    return this.passkeys.startAuthentication();
  }

  @ApiOperation({
    summary: 'Complete passkey sign-in and set the session cookie',
  })
  @Post('login/verify')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async loginVerify(
    @Body() body: { handle: string; response: any },
    @Response({ passthrough: true }) response,
  ) {
    const user = await this.passkeys.finishAuthentication(
      body.handle,
      body.response,
    );

    // Deliberately the same session the password and Google paths issue, so
    // everything downstream (guards, roles, forced password change) behaves
    // identically no matter how the user got here.
    const signInData = {
      id: user.id,
      email: user.email,
      name: user.name || user.email,
      roles: user.roles ?? [],
      studentId: user.studentId ?? null,
      // A passkey proves possession of the device and usually a biometric, so
      // it clears a pending temporary password the same way Google sign-in does.
      mustChangePassword: false,
    };
    const token = await this.authService.getToken(signInData);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: JWT_LIFETIME_MS,
    });

    return { user: { ...signInData, id: String(signInData.id) } };
  }
}
