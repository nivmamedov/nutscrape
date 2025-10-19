import { Scrape, ScrapeSchema } from '@app/nutscrapedb';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapeController } from './scrape.controller';
import { UserAgentMappingService } from './services/user-agent-mapping.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Scrape.name, schema: ScrapeSchema }],
      'nutscrapi',
    ),
    BullModule.registerQueue({
      name: 'scrape_jobs',
    }),
  ],
  controllers: [ScrapeController],
  providers: [UserAgentMappingService],
})
export class ScrapeModule {}
