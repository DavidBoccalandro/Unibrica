import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReversalService } from '../services/reversal.service';
import { ReversalRecord } from '../entities/reversal.entity';

@Controller('reversal')
export class ReversalController {
  constructor(private readonly reversalService: ReversalService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReversal(@UploadedFile() file: Express.Multer.File): Promise<ReversalRecord[]> {
    return this.reversalService.uploadReversalSheet(file);
  }
}
