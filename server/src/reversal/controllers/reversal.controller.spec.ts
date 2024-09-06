import { Test, TestingModule } from '@nestjs/testing';
import { ReversalController } from './reversal.controller';

describe('ReversalController', () => {
  let controller: ReversalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReversalController],
    }).compile();

    controller = module.get<ReversalController>(ReversalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
