export interface FilterInExcel {
  name: string;
  value: string | number;
  operator?: string;
  start?: Date;
  end?: Date;
}
