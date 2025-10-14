import { Injectable } from '@nestjs/common';

@Injectable()
export class NutscrapejobService {
  getHello(): string {
    return 'Hello World!';
  }
}
