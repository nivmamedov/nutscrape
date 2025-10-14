import { NestFactory } from '@nestjs/core';
import { NutscraperModule } from './nutscraper.module';

async function bootstrap() {
  const app = await NestFactory.create(NutscraperModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
