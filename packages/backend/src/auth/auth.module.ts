import { Module } from '@nestjs/common';
// import { AuthController } from './auth.controller';
import { PassportAuthController } from './passport-auth.controller';
import { AuthService } from './auth.service';
import { TeachersModule } from 'src/teachers/teachers.module';
import { UsersModule } from 'src/users/users.module';
import * as fs from 'fs';
import * as path from 'path';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JWT_LIFETIME } from './auth.constants';

// Minimal .env loader: KEY=VALUE per line, '#' comments, optional quotes.
// Real environment variables always win over the file.
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const match = line.match(/^\s*(?!#)([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const value = (match[2] ?? '').trim().replace(/^(['"])(.*)\1$/, '$2');
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
}

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
loadEnvFile(path.resolve(process.cwd(), envFile));

@Module({
  controllers: [PassportAuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, GoogleStrategy],
  imports: [
    TeachersModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: JWT_LIFETIME },
    }),
    PassportModule,
  ],
})
export class AuthModule {}
