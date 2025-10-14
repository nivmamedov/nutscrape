import { Controller, Get } from '@nestjs/common';
import { NutscraperService } from './nutscraper.service';

@Controller()
export class NutscraperController {
  constructor(private readonly nutscraperService: NutscraperService) {}

  @Get()
  getHello(): string {
    return this.nutscraperService.getHello();
  }
}
