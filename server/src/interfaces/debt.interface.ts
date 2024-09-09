export interface IDebt {
  idDebt: string;
  dueDate: Date;
  amount: number;
}

export interface IDebtSheet {
  date: Date;
}

export interface IDebtor {
  dni: string;
  idDebtor: string;
  // firstNames: string;
  // lastNames: string;
}

export interface IAccount {
  branch: number;
  type: number;
  acctNumber: string;
  exchangeType: number;
}
