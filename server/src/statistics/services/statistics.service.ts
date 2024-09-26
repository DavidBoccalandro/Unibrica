import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatisticsPaymentEntity } from '../entities/statisticsPayment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(StatisticsPaymentEntity)
    private readonly statisticsRepository: Repository<StatisticsPaymentEntity>
  ) {}

  async getStatistics(
    clientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StatisticsPaymentEntity[]> {
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
        clientStatisticsMap.set(clientName, {
          clientName,
          statistics: { totalDebitAmount: {}, totalRemainingDebt: {} },
        });
      }

      const clientStats = clientStatisticsMap.get(clientName);
      // Inicializar los valores en 0 si no existen
      clientStats.statistics.totalDebitAmount[date] =
        (clientStats.statistics.totalDebitAmount[date] || 0) + +stat.totalDebitAmount;
      clientStats.statistics.totalRemainingDebt[date] =
        (clientStats.statistics.totalRemainingDebt[date] || 0) + +stat.totalRemainingDebt;
    });

    // Generar un rango de fechas
    const allDates = this.generateDateRange(startDate, endDate);

    // Asegurar que cada cliente tenga un registro para cada fecha con ambos campos inicializados en 0
    const result = Array.from(clientStatisticsMap.values()).map((clientStats) => {
      const totalDebitAmountWithZeros = allDates.reduce((acc, date) => {
        acc[date] = clientStats.statistics.totalDebitAmount[date] || 0;
        return acc;
      }, {});

      const totalRemainingDebtWithZeros = allDates.reduce((acc, date) => {
        acc[date] = clientStats.statistics.totalRemainingDebt[date] || 0;
        return acc;
      }, {});

      return {
        clientName: clientStats.clientName,
        statistics: {
          totalDebitAmount: totalDebitAmountWithZeros,
          totalRemainingDebt: totalRemainingDebtWithZeros,
        },
      };
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
