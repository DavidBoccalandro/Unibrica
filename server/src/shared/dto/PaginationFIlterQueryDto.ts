export interface PaginationFilterQueryDto {
  limit: number;
  offset: number;
  filters?: any;
  sortBy?: string;
  sortOrder?: string;
  date?: string;
  startDate?: Date;
  endDate?: Date;
}
