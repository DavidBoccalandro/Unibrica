export interface PaginationFilterQueryDto {
  limit: number;
  offset: number;
  stringFilters?: { filterBy: string; filterValue: string }[];
  numericFilters?: { filterBy: string; operator?: string; filterValue: number }[];
  sortBy?: string;
  sortOrder?: string;
  date?: string;
  startDate?: Date;
  endDate?: Date;
}
