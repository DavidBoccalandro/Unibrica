export interface PaginationFilterQueryDto {
  limit: number;
  offset: number;
  stringFilters?: { filterBy: string; filterValue: string }[];
  numericFilters?: { filterBy: string; operator?: string; filterValue: number }[];
  dateFilters?: { filterBy: string; startDate: Date; endDate: Date }[];
  sortBy?: string;
  sortOrder?: string;
}
