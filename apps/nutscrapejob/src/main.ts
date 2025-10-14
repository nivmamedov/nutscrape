import { NestFactory } from '@nestjs/core';
import { NutscrapejobModule } from './nutscrapejob.module';

async function bootstrap() {
  const app = await NestFactory.create(NutscrapejobModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
