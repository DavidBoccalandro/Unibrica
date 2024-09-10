import { Test, TestingModule } from '@nestjs/testing';
import { ReversalService } from './reversal.service';

describe('ReversalService', () => {
  let service: ReversalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReversalService],
    }).compile();

    service = module.get<ReversalService>(ReversalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
