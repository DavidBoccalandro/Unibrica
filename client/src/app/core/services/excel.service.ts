import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private http: HttpClient) {}

  downloadExcel(fileName: string) {
    const url = 'http://localhost:8000/api/sheets/download/' + fileName
    return this.http.get(url, {
      responseType: 'blob'  // Importante para manejar archivos binarios
    });
  }
}
