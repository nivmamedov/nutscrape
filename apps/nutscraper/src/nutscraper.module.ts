import { Module } from '@nestjs/common';
import { NutscraperController } from './nutscraper.controller';
import { NutscraperService } from './nutscraper.service';

@Module({
  imports: [],
  controllers: [NutscraperController],
  providers: [NutscraperService],
})
export class NutscraperModule {}
