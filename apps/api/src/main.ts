import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl =
  process.env.FRONTEND_URL ??
  "http://localhost:3000";

  app.enableCors({
  origin: frontendUrl,
  credentials: true,
});

  app.enableShutdownHooks();

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

  await app.listen(4000);

  console.log('GameHub API disponível em http://localhost:4000');
}

bootstrap();