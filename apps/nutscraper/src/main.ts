import { NestFactory } from '@nestjs/core';
import { NutscraperModule } from './nutscraper.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(NutscraperModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
}
bootstrap();
