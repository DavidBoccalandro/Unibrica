import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable()
export class UploadFileService {
  private UploadFileUrls = {
    'deudas': `${environment.envVar.API_URL}/debts/uploadDebtSheet`,
    'cobros': `${environment.envVar.API_URL}/payment/upload`,
    'rebajas': /* work in progress*/ ''};

  private uploadingSubject = new BehaviorSubject<boolean>(false);
  public uploading$ = this.uploadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  postUploadDebtSheet(
    files: FileList,
    userId: string,
    clientId: string,
    bankId: string,
    fileType: 'cobros' | 'deudas' | 'rebajas'
  ): Observable<any> {
    this.uploadingSubject.next(true);

    const formData: FormData = new FormData();

    console.log('FILE: ', files)
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
        this.uploadingSubject.next(false);
      },
      () => {
        this.uploadingSubject.next(false);
      }
    );

    return postUpload;
  }
}
