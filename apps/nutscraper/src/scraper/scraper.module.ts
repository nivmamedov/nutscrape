import { Scrape, ScrapeSchema } from '@app/nutscrapedb';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScraperProcessor } from './scraper.processor';
import { ScraperService } from './scraper.service';

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
  providers: [ScraperProcessor, ScraperService],
})
export class ScraperModule {}
