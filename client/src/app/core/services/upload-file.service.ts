import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
import { environment } from 'src/enviroments/enviroment';

@Injectable()
export class UploadFileService {
  private UploadFileUrls = {
    deudas: `${environment.envVar.API_URL}/debts/uploadDebtSheet`,
    cobros: `${environment.envVar.API_URL}/payment/upload`,
    reversas: `${environment.envVar.API_URL}/reversal/upload`,
  };

  private uploadingSubject = new BehaviorSubject<boolean>(false);
  public uploading$ = this.uploadingSubject.asObservable();

  uploadSuccessSubject = new BehaviorSubject<boolean>(false);
  public uploadSuccess$ = this.uploadSuccessSubject.asObservable();

  constructor(private http: HttpClient) {}

  postUploadDebtSheet(
    files: FileList,
    userId: string,
    client: Client | null,
    bankId: string,
    fileType: 'cobros' | 'deudas' | 'reversas',
    optionalFile?: FileList
  ): void {
    this.uploadingSubject.next(true);

    const formData: FormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }
    formData.append('userId', userId);
    formData.append('clientId', client ? client.agreementNumber.toString() : '');
    formData.append('clientName', client ? client.name : '');
    formData.append('bankId', bankId);

    if (optionalFile) {
      for (let i = 0; i < optionalFile.length; i++) {
        formData.append('files', optionalFile[i], optionalFile[i].name);
      }
    }

    this.http.post<any>(this.UploadFileUrls[fileType], formData).subscribe({
      next: (response) => {
        console.log('Exito!', response)
        this.uploadSuccessSubject.next(true);
        this.uploadingSubject.next(false);
      },
      error: (error) => {
        console.log('Fail!', error)
        this.uploadSuccessSubject.next(false);
        this.uploadingSubject.next(false);
      }
    });
  }

  resetUploadSuccessSubject() {
    this.uploadSuccessSubject.next(false);
  }
}
