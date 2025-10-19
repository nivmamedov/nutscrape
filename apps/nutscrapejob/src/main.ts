import { NestFactory } from '@nestjs/core';
import { NutscrapejobModule } from './nutscrapejob.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(NutscrapejobModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
}
bootstrap();
