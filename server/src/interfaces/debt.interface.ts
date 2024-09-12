export interface IDebt {
  idDebt: string;
  dueDate: Date;
  amount: number;
}

export interface IDebtor {
  dni: string;
  firstNames: string;
  lastNames: string;
}

export interface IAccount {
  branch: number;
  type: number;
  acctNumber: string;
  exchangeType: number;
}
