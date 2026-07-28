import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

describe('TeachersController', () => {
  let controller: TeachersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        {
          provide: TeachersService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            batchUpsert: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TeachersController>(TeachersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
