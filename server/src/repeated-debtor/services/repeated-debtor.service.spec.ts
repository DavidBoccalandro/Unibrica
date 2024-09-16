import { Test, TestingModule } from '@nestjs/testing';
import { RepeatedDebtorService } from './repeated-debtor.service';

describe('RepeatedDebtorService', () => {
  let service: RepeatedDebtorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepeatedDebtorService],
    }).compile();

    service = module.get<RepeatedDebtorService>(RepeatedDebtorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
