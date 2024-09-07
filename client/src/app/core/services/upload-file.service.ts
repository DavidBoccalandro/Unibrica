import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable()
export class UploadFileService {
  private UploadFileUrls = {
    'deudas': `${environment.envVar.API_URL}/debts/uploadDebtSheet`,
    'cobros': `${environment.envVar.API_URL}/payment/upload`,
    'reversas': `${environment.envVar.API_URL}/reversal/upload`
  };

  private uploadingSubject = new BehaviorSubject<boolean>(false);
  public uploading$ = this.uploadingSubject.asObservable();

  private uploadSuccessSubject = new BehaviorSubject<boolean>(false);  // Nuevo BehaviorSubject para rastrear éxito
  public uploadSuccess$ = this.uploadSuccessSubject.asObservable();   // Observable para el éxito de la carga

  constructor(private http: HttpClient) {}

  postUploadDebtSheet(
    files: FileList,
    userId: string,
    clientId: string,
    bankId: string,
    fileType: 'cobros' | 'deudas' | 'reversas',
  ): Observable<any> {
    this.uploadingSubject.next(true);

    const formData: FormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i], files[i].name);
    }
    formData.append('userId', userId);
    formData.append('clientId', clientId);
    formData.append('bankId', bankId);

    let postUpload = this.http.post<any>(this.UploadFileUrls[fileType], formData);

    postUpload.subscribe(
      (response) => {
        console.log('Respuesta del servidor:', response);
        this.uploadSuccessSubject.next(true);  // Señalamos que la carga fue exitosa
        this.uploadingSubject.next(false);
      },
      () => {
        this.uploadSuccessSubject.next(false);  // Señalamos que la carga falló
        this.uploadingSubject.next(false);
      }
    );

    return postUpload;
  }
}
