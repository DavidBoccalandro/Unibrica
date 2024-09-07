export class UpdateReversalDto {
  agreementNumber?: number;
  serviceNumber?: string;
  companyNumber?: string;
  bankCode?: string;
  branchCode?: number;
  accountType?: number;
  accountNumber?: string;
  currentID?: string;
  debitID?: string;
  movementFunction?: string;
  rejectionCode?: string;
  dueDate?: Date;
  debitAmount?: number;
}
