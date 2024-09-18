import { DebtorEntity } from '../entities/debtors.entity';

export interface DebtorStatistics {
  debtor: DebtorEntity;
  statistics: {
    totalLoansLastMonth: number;
    totalLoansLastYear: number;
    clientLoans: Array<{ client: string; loans: number }>;
  };
}
