import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClientsService } from 'src/app/core/services/clients.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { UploadFileService } from 'src/app/core/services/upload-file.service';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
import { FilesService, ParamsWithFilters } from 'src/app/files/services/files.service';
import { BehaviorSubject, take } from 'rxjs';

const MaterialModules = [
  MatDialogModule,
  MatButtonModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatIconModule,
  MatSlideToggleModule
];

@Component({
  selector: 'app-upload-file-modal',
  standalone: true,
  imports: [CommonModule, ...MaterialModules, ReactiveFormsModule, FormsModule],
  providers: [ExcelService, UploadFileService, FilesService],
  templateUrl: './upload-file-modal.component.html',
  styleUrls: ['./upload-file-modal.component.scss'],
})
export class UploadFileModalComponent implements OnInit {
  @Input() fileAccept = '.lis,.xlsx,.xls,.csv,.txt';
  form!: FormGroup;
  files!: FileList | null;
  optionalFiles!: FileList | null;
  clients: Client[] = [];
  banks: any[] = [];
  selectedClientId!: string;
  selectedBankId!: string;
  userId!: string;
  fileSelected: string = '';
  isPagbaSelected = false;
  isFileRepeated = false;
  filesInDB: string[] = []

  uploading$ = this.uploadFileService.uploading$;
  uploadSuccess$ = this.uploadFileService.uploadSuccess$;

  params = new BehaviorSubject<ParamsWithFilters>({
    limit: 10,
    offset: 0,
  });
  $params = this.params.asObservable();

  constructor(
    public dialogRef: MatDialogRef<UploadFileModalComponent>,
    private fb: FormBuilder,
    private uploadFileService: UploadFileService,
    private clientService: ClientsService,
    private filesService: FilesService,
    private snackBar: NotificationsService,
    private excelService: ExcelService
  ) {
    this.form = this.fb.group({
      client: ['', [Validators.required]],
      fileType: ['', [Validators.required]],
      multipleFilesAccepted: [false]
    });
  }

  ngOnInit(): void {
    this.getClients();
    this.uploading$.subscribe((uploading) => {
      if (uploading) {
        this.snackBar.emitNotification(
          'La información se está procesando. Por favor espere unos minutos a que finalice la carga en la base de datos.',
          'info',
          500
        );
      }
    });

    this.filesService.getAllSheets(this.params.value).pipe(take(1)).subscribe(data => {
      this.filesInDB = data.sheets.map((file) => file.fileName)
    })
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSelectedFiles(event: any, type: string): void {
    if(type === 'main') {
      this.files = event.target.files ?? null;
      this.fileSelected = this.files![0].name.substring(0, this.files![0].name.length - 4);
      this.checkIfFileIsRepeated()
    } else {
      this.optionalFiles = event.target.files ?? null;
    }
  }

  get filesLabel(): string {
    if (!this.files?.length) {
      return 'No hay archivo seleccionado';
    }
    const filesSelected = this.files?.length;
    switch (filesSelected) {
      case 1:
        return this.files[0].name;
      default:
        return `${this.files.length} archivos seleccionados`;
    }
  }

  onUploadFiles(): void {
    const client = this.clients.find((client) => client.name === this.form.value['client']!);

    this.uploadFileService.postUploadDebtSheet(
      this.files!,
      'e1cac08c-145b-469b-ae9d-c1c76d3ff001',
      client?.clientId ? client : null,
      this.selectedBankId,
      this.form.value['fileType'],
      this.optionalFiles ?? undefined,
    );
    this.files = null;
    this.form.reset();
  }

  checkIfFileIsRepeated(): void {
    const aux = this.filesInDB.findIndex(file => file.match(this.fileSelected)) >= 0
    if (aux) {
      this.isFileRepeated = true;
    } else {
      this.isFileRepeated = false;
    }
  }

  getClients() {
    this.clientService.getClients().subscribe((clients) => {
      this.clients = clients;
    });
  }

  fileTypeSelected(option: any) {
    // console.log('option.value:', option.value)
    if(option.value === 'cobros') {
      this.isPagbaSelected = true
    } else {
      this.isPagbaSelected = false
    }
  }

  downloadExcel() {
    this.excelService.downloadExcel(this.fileSelected).subscribe(
      (data: Blob) => {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.fileSelected}.xlsx`; // Nombre del archivo descargado
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // Limpia la URL del blob
      },
      (error) => {
        console.error('Error al descargar el archivo', error);
      }
    );
  }
}
