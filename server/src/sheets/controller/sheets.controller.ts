import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';
import { SheetsService } from '../services/sheets.service';

@Controller('sheets')
export class SheetsController {
  constructor(private sheetsService: SheetsService) {}

  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'uploads', filename + '.xlsx'); // Ruta del archivo
    console.log('filePatch: ', filePath);
    res.download(filePath, 'archivo.xlsx', (err) => {
      if (err) {
        console.error('Error en la descarga del archivo:', err);
        res.status(500).send('Error al descargar el archivo');
      }
    });
  }

  @Get()
  findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('stringFilters') stringFilters: string,
    @Query('numericFilters') numericFilters: string,
    @Query('dateFilters') dateFilters: string
  ) {
    // console.log(
    //   'filters',
    //   stringFilters,
    //   typeof stringFilters,
    //   numericFilters,
    //   typeof numericFilters
    // );
    let parsedStringFilters, parsedNumericFilters, parsedDateFilters;
    if (stringFilters && stringFilters !== 'undefined') {
      parsedStringFilters = JSON.parse(stringFilters);
    }
    if (numericFilters && numericFilters !== 'undefined') {
      parsedNumericFilters = JSON.parse(numericFilters);
    }
    if (dateFilters && dateFilters !== 'undefined') {
      parsedDateFilters = JSON.parse(dateFilters);
    }

    return this.sheetsService.getAllSheets({
      limit,
      offset,
      stringFilters: parsedStringFilters,
      numericFilters: parsedNumericFilters,
      dateFilters: parsedDateFilters,
    });
  }
}
