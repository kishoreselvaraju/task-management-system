/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  global /api prefix
  app.setGlobalPrefix('api');

  // proper CORS setup
  app.enableCors({
    origin: 'http://localhost:4200', // allow Angular dev server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.listen(3000);
  console.log(`🚀 API running on http://localhost:3000/api`);
}
 

bootstrap();
