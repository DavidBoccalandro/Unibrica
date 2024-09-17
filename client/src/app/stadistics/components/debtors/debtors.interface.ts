import { RepeatedDebtor } from "src/app/files/components/file-log/file-log.component";
import { Debt } from "../debts/debts.interface";

export interface Debtor {
  dni: string;
  firstNames: string;
  lastNames: string;
  debts: Debt[];
  repeatedDebtor: RepeatedDebtor;
}
