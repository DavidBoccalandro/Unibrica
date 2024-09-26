import { Module } from '@nestjs/common';
import { SheetsController } from './controller/sheets.controller';
import { SheetsService } from './services/sheets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SheetEntity } from 'src/shared/entities/sheet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SheetEntity])],
  controllers: [SheetsController],
  providers: [SheetsService],
})
export class SheetsModule {}
