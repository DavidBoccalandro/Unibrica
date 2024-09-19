export interface DebtorStatistics {
  totalLoansLastMonth: number;
  totalLoansLastYear: number;
  clientLoans: Array<{ client: string; loans: number }>;
}

export interface DebtorStatisticsMap {
  [debtorId: string]: DebtorStatistics;
}
