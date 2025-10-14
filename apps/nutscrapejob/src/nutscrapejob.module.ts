import { Module } from '@nestjs/common';
import { NutscrapejobController } from './nutscrapejob.controller';
import { NutscrapejobService } from './nutscrapejob.service';

@Module({
  imports: [],
  controllers: [NutscrapejobController],
  providers: [NutscrapejobService],
})
export class NutscrapejobModule {}
