import { Test, TestingModule } from '@nestjs/testing';
import { RepeatedDebtorController } from './repeated-debtor.controller';

describe('RepeatedDebtorController', () => {
  let controller: RepeatedDebtorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepeatedDebtorController],
    }).compile();

    controller = module.get<RepeatedDebtorController>(RepeatedDebtorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
