import { Injectable } from '@nestjs/common';

@Injectable()
export class NutscraperService {
  getHello(): string {
    return 'Hello World!';
  }
}
