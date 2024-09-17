import { Controller, Get, Query } from '@nestjs/common';
import { RepeatedDebtorService } from '../services/repeated-debtor.service';

@Controller('repeated_debtors')
export class RepeatedDebtorController {
  constructor(private repeatedDebtorRepository: RepeatedDebtorService) {}

  @Get('all')
  public async getAllRepeatedDebtors(
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

    return this.repeatedDebtorRepository.getAllRepeatedDebtors();
  }
}
