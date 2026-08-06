/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];

function assertRequiredEnvVars() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Check .env / .env.production before starting the app.',
    );
  }
}

async function bootstrap() {
  assertRequiredEnvVars();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    abortOnError: false,
  });

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const DEFAULT_CORS_ORIGINS = [
    'http://localhost:3001',
    'http://83.168.71.6:3001',
    'http://krusant.szkolazlotnictwa.pl',
    'https://krusant.szkolazlotnictwa.pl',
  ];
  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : DEFAULT_CORS_ORIGINS,
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('KRUSANT API')
    .setDescription('API documentation for KRUSANT backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  // Local dev aid only (gitignored). Swagger UI at /api/docs is the source of
  // truth; nothing consumes a checked-in copy.
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  await app.listen(3002);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
