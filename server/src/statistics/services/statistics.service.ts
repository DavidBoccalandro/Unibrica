import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatisticsPaymentEntity } from '../entities/statisticsPayment.entity';
import { Repository } from 'typeorm';
import { StatisticsDebtEntity } from '../entities/statisticsDebt.entity';
import { StatisticsReversalEntity } from '../entities/statisticsReversal.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(StatisticsPaymentEntity)
    private readonly statisticsPaymentRepository: Repository<StatisticsPaymentEntity>,
    @InjectRepository(StatisticsDebtEntity)
    private readonly statisticsDebtRepository: Repository<StatisticsDebtEntity>,
    @InjectRepository(StatisticsReversalEntity)
    private readonly statisticsReversalRepository: Repository<StatisticsReversalEntity>
  ) {}

  async getStatistics(
    clientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StatisticsPaymentEntity[]> {
    const statistics = await this.statisticsPaymentRepository
      .createQueryBuilder('statistics')
      .leftJoinAndSelect('statistics.client', 'client')
      .where('client.agreementNumber = :clientId', { agreementNumber: +clientId })
      .andWhere('statistics.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    return statistics;
  }

  /**
   * Obtiene estadísticas mensuales de pagos, deudas y reversas para todos los clientes dentro de un rango de fechas.
   *
   * @param {Date} startDate - Fecha de inicio del rango.
   * @param {Date} endDate - Fecha de fin del rango.
   * @returns {Promise<Array>} - Arreglo con las estadísticas de cada cliente.
   */
  async getMonthlyStatistics(startDate: Date, endDate: Date): Promise<any> {
    // Obtener estadísticas de pagos
    const paymentStatistics = await this.statisticsPaymentRepository
      .createQueryBuilder('statistics')
      .leftJoinAndSelect('statistics.client', 'client')
      .andWhere('statistics.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    // Obtener estadísticas de deudas
    const debtStatistics = await this.statisticsDebtRepository
      .createQueryBuilder('statistics')
      .leftJoinAndSelect('statistics.client', 'client')
      .andWhere('statistics.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    // Obtener estadísticas de reversas
    const reversalStatistics = await this.statisticsReversalRepository
      .createQueryBuilder('statistics')
      .leftJoinAndSelect('statistics.client', 'client')
      .andWhere('statistics.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    // Procesar los datos para generar el formato esperado
    const clientStatisticsMap = new Map<string, any>();

    paymentStatistics.forEach((stat) => {
      const clientName = stat.client.name;
      const date = stat.date.toISOString().split('T')[0];

      if (!clientStatisticsMap.has(clientName)) {
        clientStatisticsMap.set(clientName, {
          clientName,
          statistics: {
            totalDebtAmount: {}, // Se rellenará más adelante con datos de deuda
            totalDebitAmount: {},
            totalRemainingDebt: {},
            totalReversalAmount: {}, // Nuevo campo para reversas
          },
        });
      }

      const clientStats = clientStatisticsMap.get(clientName);
      clientStats.statistics.totalDebitAmount[date] =
        (clientStats.statistics.totalDebitAmount[date] || 0) + +stat.totalDebitAmount;
      clientStats.statistics.totalRemainingDebt[date] =
        (clientStats.statistics.totalRemainingDebt[date] || 0) + +stat.totalRemainingDebt;
    });

    debtStatistics.forEach((stat) => {
      const clientName = stat.client.name;
      const date = stat.date.toISOString().split('T')[0];

      if (!clientStatisticsMap.has(clientName)) {
        clientStatisticsMap.set(clientName, {
          clientName,
          statistics: {
            totalDebtAmount: {},
            totalDebitAmount: {},
            totalRemainingDebt: {},
            totalReversalAmount: {},
          },
        });
      }

      const clientStats = clientStatisticsMap.get(clientName);
      clientStats.statistics.totalDebtAmount[date] =
        (clientStats.statistics.totalDebtAmount[date] || 0) + +stat.totalDebtAmount;
    });

    reversalStatistics.forEach((stat) => {
      const clientName = stat.client.name;
      const date = stat.date.toISOString().split('T')[0];

      if (!clientStatisticsMap.has(clientName)) {
        clientStatisticsMap.set(clientName, {
          clientName,
          statistics: {
            totalDebtAmount: {},
            totalDebitAmount: {},
            totalRemainingDebt: {},
            totalReversalAmount: {},
          },
        });
      }

      const clientStats = clientStatisticsMap.get(clientName);
      clientStats.statistics.totalReversalAmount[date] =
        (clientStats.statistics.totalReversalAmount[date] || 0) + +stat.totalReversalAmount;
    });

    // Generar un rango de fechas
    const allDates = this.generateDateRange(startDate, endDate);

    // Asegurar que cada cliente tenga un registro para cada fecha con todos los campos inicializados en 0
    const result = Array.from(clientStatisticsMap.values()).map((clientStats) => {
      const totalDebtAmountWithZeros = allDates.reduce((acc, date) => {
        acc[date] = clientStats.statistics.totalDebtAmount[date] || 0;
        return acc;
      }, {});

      const totalDebitAmountWithZeros = allDates.reduce((acc, date) => {
        acc[date] = clientStats.statistics.totalDebitAmount[date] || 0;
        return acc;
      }, {});

      const totalRemainingDebtWithZeros = allDates.reduce((acc, date) => {
        acc[date] = clientStats.statistics.totalRemainingDebt[date] || 0;
        return acc;
      }, {});

      const totalReversalAmountWithZeros = allDates.reduce((acc, date) => {
        acc[date] = clientStats.statistics.totalReversalAmount[date] || 0;
        return acc;
      }, {});

      return {
        clientName: clientStats.clientName,
        statistics: {
          totalDebtAmount: totalDebtAmountWithZeros,
          totalDebitAmount: totalDebitAmountWithZeros,
          totalRemainingDebt: totalRemainingDebtWithZeros,
          totalReversalAmount: totalReversalAmountWithZeros,
        },
      };
    });

    return result;
  }

  /**
   * Genera un rango de fechas entre dos fechas dadas.
   *
   * @param {Date} start - Fecha de inicio.
   * @param {Date} end - Fecha de fin.
   * @returns {string[]} - Arreglo de fechas en formato 'YYYY-MM-DD'.
   */
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
