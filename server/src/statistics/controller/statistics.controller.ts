import { Controller, Get, Param, Query } from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('monthly')
  async getMonthlyStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return await this.statisticsService.getMonthlyStatistics(start, end);
  }

  @Get(':clientId')
  async getStatistics(
    @Param('clientId') clientId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Llama al servicio para obtener las estadísticas
    const statistics = await this.statisticsService.getStatistics(clientId, start, end);
    return statistics;
  }
}
