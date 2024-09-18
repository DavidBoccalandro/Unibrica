import { Between, Repository } from 'typeorm';
import { DebtorEntity } from '../entities/debtors.entity';
import { DebtEntity } from '../entities/debts.entity';
import { DebtorStatistics } from './debtorStatistics.interface';

export async function generateDebtorStatistics(
  debtor: DebtorEntity,
  debtRepository: Repository<DebtEntity>
): Promise<DebtorStatistics> {
  // Consultar la cantidad de préstamos en el último mes y año
  const currentDate = new Date();
  const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastYearDate = new Date(currentDate.getFullYear() - 1, 0, 1);

  const loansLastMonth = await debtRepository.count({
    where: {
      debtor: { id: debtor.id },
      sheet: {
        date: Between(lastMonthDate, currentDate),
      },
    },
  });

  const loansLastYear = await debtRepository.count({
    where: {
      debtor: { id: debtor.id },
      sheet: {
        date: Between(lastYearDate, currentDate),
      },
    },
  });

  // Consultar la cantidad de préstamos por empresa
  const clientLoansMap = new Map<string, number>();

  const debtsByClient = await debtRepository.find({
    where: { debtor: { id: debtor.id } },
    relations: ['client', 'sheet'],
  });

  debtsByClient.forEach((debt) => {
    const clientName = debt.client.name;
    if (!clientLoansMap.has(clientName)) {
      clientLoansMap.set(clientName, 0);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    clientLoansMap.set(clientName, clientLoansMap.get(clientName)! + 1);
  });

  // Convertir el Map a un array de objetos { client, loans }
  const clientLoansArray = Array.from(clientLoansMap.entries()).map(([client, loans]) => ({
    client,
    loans,
  }));

  return {
    debtor,
    statistics: {
      totalLoansLastMonth: loansLastMonth,
      totalLoansLastYear: loansLastYear,
      clientLoans: clientLoansArray,
    },
  };
}
