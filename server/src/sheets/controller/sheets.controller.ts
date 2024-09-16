import { Controller, Get, HttpException, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';
import { SheetsService } from '../services/sheets.service';
import * as fs from 'fs';

@Controller('sheets')
export class SheetsController {
  constructor(private sheetsService: SheetsService) {}

  @Get('download/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      let filePath = join(__dirname, '..', '..', '..', 'uploads', `${filename}.xlsx`);
      let filenameWithExtension = `${filename}.xlsx`;

      // console.log('Ruta del archivo:', filePathXLSX);
      if (!fs.existsSync(filePath)) {
        filePath = join(__dirname, '..', '..', '..', 'uploads', `${filename}.xls`);
        filenameWithExtension = `${filename}.xls`;
      }
      if (!fs.existsSync(filePath)) {
        throw new HttpException('Archivo no encontrado', HttpStatus.NOT_FOUND);
      }

      res.download(filePath, filenameWithExtension, (err) => {
        if (err) {
          console.error('Error al descargar el archivo:', err);
          res.status(500).send('Error al descargar el archivo');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      throw new HttpException('Error al procesar la descarga', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
