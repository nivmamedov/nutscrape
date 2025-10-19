import { Scrape, ScrapeSchema } from '@app/nutscrapedb';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScraperProcessor } from './scraper.processor';
import { ScraperService } from './scraper.service';
import { RetryService } from './services/retry.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Scrape.name, schema: ScrapeSchema }],
      'nutscraper',
    ),
    BullModule.registerQueue({
      name: 'scrapes',
    }),
  ],
  providers: [ScraperProcessor, ScraperService, RetryService],
})
export class ScraperModule {}
