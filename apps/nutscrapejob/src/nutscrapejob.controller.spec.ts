import { Test, TestingModule } from '@nestjs/testing';
import { NutscrapejobController } from './nutscrapejob.controller';
import { NutscrapejobService } from './nutscrapejob.service';

describe('NutscrapejobController', () => {
  let nutscrapejobController: NutscrapejobController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NutscrapejobController],
      providers: [NutscrapejobService],
    }).compile();

    nutscrapejobController = app.get<NutscrapejobController>(
      NutscrapejobController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(nutscrapejobController.getHello()).toBe('Hello World!');
    });
  });
});
