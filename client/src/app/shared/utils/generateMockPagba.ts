import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LisFileService {

  constructor() { }

  // Método para generar datos aleatorios
  private generateRandomData(): any {
    return {
      tipoRegistro: '2', // Ejemplo fijo
      convenio: String(Math.floor(Math.random() * 99999)),
      // servicio: '0101P', // Ejemplo fijo
      empresa: String(Math.floor(Math.random() * 99999)),
      abonado: String(Math.floor(Math.random() * 99999999999999999999)),
      fechaDebito: this.randomDate(),
      importeMov: String(Math.floor(Math.random() * 9999999999)),
      banco: '285',
      tipocta: '4',
      succta: String(Math.floor(Math.random() * 999)).padStart(3, '0'),
      cuenta: String(Math.floor(Math.random() * 999999999999999)),
      libre: ' ',
      secuencialDebito: String(Math.floor(Math.random() * 99)).padStart(2, '0'),
      cuota: String(Math.floor(Math.random() * 99)).padStart(2, '0'),
      estado: 'P',
      libres: ' '.repeat(20),
      montoCobrado: String(Math.floor(Math.random() * 999999999)).padStart(12, '0')
    };
  }

  // Método para generar una fecha aleatoria dentro del último año en el formato DDMMYYYY
  private randomDate(option?: boolean): string {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    const randomTimestamp = lastYear.getTime() + Math.random() * (today.getTime() - lastYear.getTime());
    const randomDate = new Date(randomTimestamp);

    const day = String(randomDate.getDate()).padStart(2, '0');
    const month = '09'
    const year = 2024;

    if(option) {
      return `${day}${month}${year}`;
    }
    return `${year}${month}${day}`;
  }

  // Método para generar el contenido del archivo .lis
  generateLisContent(lineCount: number): string {
    const lines: string[] = [];

    for (let i = 0; i < lineCount; i++) {
      const item = this.generateRandomData();
      const line = [
        item.tipoRegistro,
        item.convenio.padStart(5, '0').padEnd(15, ' '),
        // item.servicio.padEnd(10, ' '),
        item.empresa.padStart(5, '0'),
        item.abonado.padStart(20, '0'),
        item.fechaDebito,
        item.importeMov.padStart(11, '0'),
        item.banco.padStart(3, '0'),
        item.tipocta,
        item.succta.padStart(3, '0'),
        item.cuenta.padStart(15, '0'),
        item.libre.padEnd(1, ' '),
        item.secuencialDebito.padStart(2, '0'),
        item.cuota,
        item.estado,
        item.libres.padEnd(20, ' '),
        item.montoCobrado.padStart(1, '0')
      ].join('');
      lines.push(line);
    }

    return lines.join('\n');
  }
  // Método para generar un nombre de archivo aleatorio
  private generateRandomFilename(): string {
    const randomNumber = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const randomDate = this.randomDate(true); // Usa la función para obtener una fecha aleatoria
    return `pagpa74550_${randomDate}_of${randomNumber}`;
  }

  // Método para descargar el archivo .lis
  downloadLisFile(lineCount: number) {
    const content = this.generateLisContent(lineCount);
    const filename = this.generateRandomFilename();
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${filename}.lis`;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
}
