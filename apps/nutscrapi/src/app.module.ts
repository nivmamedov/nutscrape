import { DatabaseModule } from '@app/nutscrapedb';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { ScrapeModule } from './scrape/scrape.module';

@Module({
  imports: [
    DatabaseModule.forRoot({
      connectionName: 'nutscrapi',
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/Nutscrape',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000,
          limit: 5,
        },
      ],
    }),
    ScrapeModule,
    HealthModule,
  ],
})
export class AppModule {}
