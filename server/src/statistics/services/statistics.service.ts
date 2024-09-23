import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatisticsEntity } from '../entities/statistic.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(StatisticsEntity)
    private readonly statisticsRepository: Repository<StatisticsEntity>
  ) {}

  async getStatistics(
    clientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StatisticsEntity[]> {
    const statistics = await this.statisticsRepository
      .createQueryBuilder('statistics')
      .leftJoinAndSelect('statistics.client', 'client')
      .where('client.clientId = :clientId', { clientId: +clientId })
      .andWhere('statistics.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    return statistics;
  }

  async getMonthlyStatistics(startDate: Date, endDate: Date): Promise<any> {
    // Consulta para obtener todas las estadísticas dentro del rango de fechas
    const statistics = await this.statisticsRepository
      .createQueryBuilder('statistics')
      .leftJoinAndSelect('statistics.client', 'client')
      .andWhere('statistics.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    // Procesar los datos para generar el formato esperado
    const clientStatisticsMap = new Map<string, any>();

    statistics.forEach((stat) => {
      console.log('Stat: ', stat);
      const clientName = stat.client.name;
      const date = stat.date.toISOString().split('T')[0]; // Convertir la fecha a formato YYYY-MM-DD

      if (!clientStatisticsMap.has(clientName)) {
        clientStatisticsMap.set(clientName, { clientName, statistics: {} });
      }

      const clientStats = clientStatisticsMap.get(clientName);
      clientStats.statistics[date] = (clientStats.statistics[date] || 0) + stat.totalDebitAmount;
    });

    // Generar un rango de fechas
    const allDates = this.generateDateRange(startDate, endDate);

    // Asegurar que cada cliente tenga un registro para cada fecha
    const result = Array.from(clientStatisticsMap.values()).map((clientStats) => {
      const statisticsWithZeros = allDates.reduce((acc, date) => {
        acc[date] = clientStats.statistics[date] || 0; // Asignar 0 si no hay datos
        return acc;
      }, {});

      return { clientName: clientStats.clientName, statistics: statisticsWithZeros };
    });

    return result;
  }

  private generateDateRange(start: Date, end: Date): string[] {
    const dates: string[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]); // Formato YYYY-MM-DD
      currentDate.setDate(currentDate.getDate() + 1); // Sumar un día
    }

    return dates;
  }
}
