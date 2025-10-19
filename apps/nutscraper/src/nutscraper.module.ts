import { DatabaseModule } from '@app/nutscrapedb';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [
    DatabaseModule.forRoot({
      connectionName: 'nutscraper',
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/Nutscrape',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    ScraperModule,
  ],
  providers: [],
})
export class NutscraperModule {}
