import { Scrape, ScrapeSchema } from '@app/nutscrapedb';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapeJobManagerProcessor } from './manager.processor';
@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Scrape.name, schema: ScrapeSchema }],
      'nutscrapejob',
    ),
    BullModule.registerQueue({
      name: 'scrape_jobs',
    }),
    BullModule.registerQueue({
      name: 'scrapes',
    }),
  ],
  providers: [ScrapeJobManagerProcessor],
})
export class ScrapeJobManagerModule {}
