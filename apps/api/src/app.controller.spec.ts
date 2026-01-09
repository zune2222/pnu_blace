import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchoolApiService } from './school-api/school-api.service';

describe('AppController', () => {
  let appController: AppController;
  let mockSchoolApiService: any;

  beforeEach(async () => {
    mockSchoolApiService = {
      loginAsSystem: jest.fn(),
      getSeatMap: jest.fn(),
      getUserInfo: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: SchoolApiService,
          useValue: mockSchoolApiService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
    });
  });
});
