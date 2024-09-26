import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationFilterQueryDto } from 'src/shared/dto/PaginationFIlterQueryDto';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SheetsService {
  constructor(@InjectRepository(SheetEntity) private sheetRepository: Repository<SheetEntity>) {}

  async getAllSheets(
    paginationQuery: PaginationFilterQueryDto
  ): Promise<{ sheets: SheetEntity[]; totalItems: number }> {
    const { limit, offset, sortBy, sortOrder, stringFilters, numericFilters, dateFilters } =
      paginationQuery;
    let queryBuilder = this.sheetRepository
      .createQueryBuilder('sheets')
      .leftJoinAndSelect('sheets.client', 'client');
    // .leftJoinAndSelect('sheets.bank', 'bank')
    // .leftJoinAndSelect('sheets.sheet', 'sheet')

    // Aplicar filtros de cadenas (stringFilters)
    if (stringFilters && stringFilters.length > 0) {
      stringFilters.forEach((filter) => {
        const { filterBy, filterValue } = filter;
        console.log('filterBy: ', filterBy);
        // console.log('filterValue type: ', typeof filterValue);
        if (filterBy === 'clientName') {
          queryBuilder = queryBuilder.andWhere(`LOWER(client.name) LIKE :filterValue`, {
            filterValue: `%${filterValue.toLowerCase()}%`,
          });
        } else {
          queryBuilder = queryBuilder.andWhere(`LOWER(sheets.${filterBy}) LIKE :filterValue`, {
            filterValue: `%${filterValue.toLowerCase()}%`,
          });
        }
      });
    }

    // Aplicar filtros numéricos (numericFilters)
    if (numericFilters && numericFilters.length > 0) {
      numericFilters.forEach((filter, index) => {
        const { filterBy, operator, filterValue } = filter;
        const value = Number(filterValue);

        if (operator === '=' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`sheets.${filterBy} = :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '<' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`sheets.${filterBy} < :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '>' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`sheets.${filterBy} > :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '<=' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`sheets.${filterBy} <= :value${index}`, {
            [`value${index}`]: value,
          });
        } else if (operator === '>=' && !isNaN(value)) {
          queryBuilder = queryBuilder.andWhere(`sheets.${filterBy} >= :value${index}`, {
            [`value${index}`]: value,
          });
        }
      });
    }

    // Aplicar filtros de fechas (dateFilters)
    if (dateFilters && dateFilters.length > 0) {
      dateFilters.forEach((filter, index) => {
        const { filterBy, startDate, endDate } = filter;

        if (filterBy === 'fileDate' && startDate && endDate) {
          queryBuilder = queryBuilder.andWhere(
            `sheets.date BETWEEN :startDate${index} AND :endDate${index}`,
            {
              [`startDate${index}`]: startDate,
              [`endDate${index}`]: endDate,
            }
          );
        } else if (startDate && endDate && filterBy) {
          queryBuilder = queryBuilder.andWhere(
            `sheets.${filterBy} BETWEEN :startDate${index} AND :endDate${index}`,
            {
              [`startDate${index}`]: startDate,
              [`endDate${index}`]: endDate,
            }
          );
        } else {
          throw new BadRequestException('Invalid date range or field for filtering');
        }
      });
    }

    // Ejecuta la consulta para obtener el total de elementos
    const totalItems = await queryBuilder.getCount();

    if (!sortBy || !sortOrder) {
      const order = {};
      order[`sheets.created_at`] = 'DESC';
      queryBuilder = queryBuilder.orderBy(order);
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(limit).offset(offset ?? 0);
    }

    const sheets = await queryBuilder.getMany();

    return { sheets, totalItems };
  }
}
