import {
  Body,
  BadRequestException,
  Controller,
  Post,
  UseInterceptors,
  Get,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { DebtsService } from '../services/debts.service';
import { FilesInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(FilesInterceptor('files'))
  async uploadReversal(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('clientId') clientId: string
  ): Promise<string> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const uploadPromises = files.map((file) => this.debtsService.uploadDebtSheet(file, clientId));
    await Promise.all(uploadPromises);

    return 'All debt sheets uploaded successfully, and they are being processed.';
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
