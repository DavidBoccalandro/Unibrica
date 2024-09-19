import {
  Body,
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { DebtsService } from '../services/debts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

export interface PaginationQueryDto {
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: string;
  filterBy: string;
  filterValue: string;
  date: string;
  startDate: Date;
  endDate: Date;
}
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post('uploadDebtSheet')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadDebtSheet(
    @UploadedFile() file: Express.Multer.File,
    @Body('clientId') clientId: string
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return await this.debtsService.uploadDebtSheet(file, clientId);
  }

  @Get('all')
  public async getAllDebts(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('stringFilters') stringFilters: string,
    @Query('numericFilters') numericFilters: string,
    @Query('dateFilters') dateFilters: string
  ) {
    let parsedStringFilters, parsedNumericFilters, parsedDateFilters;
    if (stringFilters && stringFilters !== 'undefined') {
      parsedStringFilters = JSON.parse(stringFilters);
    }
    if (numericFilters && numericFilters !== 'undefined') {
      parsedNumericFilters = JSON.parse(numericFilters);
    }
    if (dateFilters && dateFilters !== 'undefined') {
      parsedDateFilters = JSON.parse(dateFilters);
    }

    return this.debtsService.getAllDebts({
      limit,
      offset,
      stringFilters: parsedStringFilters,
      numericFilters: parsedNumericFilters,
      dateFilters: parsedDateFilters,
    });
  }
}
