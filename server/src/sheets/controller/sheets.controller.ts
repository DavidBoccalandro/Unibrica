import { Controller, Get, Param, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';

@Controller('sheets')
export class SheetsController {
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
}
