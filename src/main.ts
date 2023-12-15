import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';
import { config } from 'dotenv';

async function bootstrap() {
  config();
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*' },
    logger: ['error', 'warn', 'debug', 'log'],
  });
  const routePrefix = process.env.API_PREFIX || null;
  if (routePrefix) {
    app.setGlobalPrefix(routePrefix);
  }
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // app.use(bodyParser.urlencoded({ extended: true }));
  await app.listen(3000);
}
bootstrap();
