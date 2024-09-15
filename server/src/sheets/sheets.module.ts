import { Module } from '@nestjs/common';
import { SheetsController } from './controller/sheets.controller';
import { SheetsService } from './services/sheets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SheetsEntity])],
  controllers: [SheetsController],
  providers: [SheetsService],
})
export class SheetsModule {}
