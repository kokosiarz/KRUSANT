import { Module } from '@nestjs/common';
// import { AuthController } from './auth.controller';
import { PassportAuthController } from './passport-auth.controller';
import { AuthService } from './auth.service';
import { TeachersModule } from 'src/teachers/teachers.module';
import { UsersModule } from 'src/users/users.module';
import { config } from 'dotenv';
import * as path from 'path';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
config({ path: path.resolve(process.cwd(), envFile) });

@Module({
  controllers: [PassportAuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, GoogleStrategy],
  imports: [
    TeachersModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3d' },
    }),
    PassportModule,
  ],
})
export class AuthModule {}
