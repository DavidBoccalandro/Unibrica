import { Sheet } from "src/app/shared/interfaces/sheet.interface";
import { Payment } from "../payments/payments/payments.component";
import { Client } from "../clients/clients.interfaces";
import { Debtor } from "../debtors/debtors.interface";

export interface Debt {
  bank?: {bankId: string};
  branchCode: number;
  accountType: number;
  account: string;
  idDebt: string;
  dueDate: Date;
  currency: string;
  amount: number;
  sheet: Sheet;
  payments?: Payment[];
  client?: Client;
  debtor: Debtor;
}
