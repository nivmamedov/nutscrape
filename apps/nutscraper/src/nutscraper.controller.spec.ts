import { Test, TestingModule } from '@nestjs/testing';
import { NutscraperController } from './nutscraper.controller';
import { NutscraperService } from './nutscraper.service';

describe('NutscraperController', () => {
  let nutscraperController: NutscraperController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NutscraperController],
      providers: [NutscraperService],
    }).compile();

    nutscraperController = app.get<NutscraperController>(NutscraperController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(nutscraperController.getHello()).toBe('Hello World!');
    });
  });
});
