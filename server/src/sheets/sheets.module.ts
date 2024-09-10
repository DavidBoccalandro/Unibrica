import { Module } from '@nestjs/common';
import { SheetsController } from './controller/sheets.controller';
import { SheetsService } from './services/sheets.service';

@Module({
  controllers: [SheetsController],
  providers: [SheetsService],
})
export class SheetsModule {}
