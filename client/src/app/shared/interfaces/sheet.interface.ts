import { Client } from "src/app/stadistics/components/clients/clients.interfaces";
import { Debt } from "src/app/stadistics/components/debts/debts.interface";
import { Payment } from "src/app/stadistics/components/payments/payments/payments.component";
import { Reversal } from "src/app/stadistics/components/reversals/reversals.component";

export interface Sheet {
  date: Date;
  fileName: string;
  debts?: Debt[];
  payments?: Payment[];
  reversals?: Reversal[];
  client?: Client;
}
