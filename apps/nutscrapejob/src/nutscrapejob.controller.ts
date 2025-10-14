import { Controller, Get } from '@nestjs/common';
import { NutscrapejobService } from './nutscrapejob.service';

@Controller()
export class NutscrapejobController {
  constructor(private readonly nutscrapejobService: NutscrapejobService) {}

  @Get()
  getHello(): string {
    return this.nutscrapejobService.getHello();
  }
}
