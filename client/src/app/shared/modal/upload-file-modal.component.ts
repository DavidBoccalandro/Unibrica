import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BanksService } from 'src/app/core/services/banks.service';
import { ClientsService } from 'src/app/core/services/clients.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { UploadFileService } from 'src/app/core/services/upload-file.service';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';

const MaterialModules = [
  MatDialogModule,
  MatButtonModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatIconModule,
];

@Component({
  selector: 'app-upload-file-modal',
  standalone: true,
  imports: [CommonModule, ...MaterialModules, ReactiveFormsModule],
  providers: [ExcelService, UploadFileService],
  templateUrl: './upload-file-modal.component.html',
  styleUrls: ['./upload-file-modal.component.scss'],
})
export class UploadFileModalComponent implements OnInit {
  @Input() fileAccept = '.lis,.xlsx,.xls,.csv,.txt';
  form!: FormGroup;
  files!: FileList | null;
  multipleFilesAccepted = true;
  clients: Client[] = [];
  banks: any[] = [];
  selectedClientId!: string;
  selectedBankId!: string;
  userId!: string;
  fileSelected: string = '';

  uploading$ = this.uploadFileService.uploading$;
  uploadSuccess$ = this.uploadFileService.uploadSuccess$;

  constructor(
    public dialogRef: MatDialogRef<UploadFileModalComponent>,
    private fb: FormBuilder,
    private uploadFileService: UploadFileService,
    private clientService: ClientsService,
    private banksService: BanksService,
    private snackBar: NotificationsService,
    private excelService: ExcelService
  ) {
    this.form = this.fb.group({
      client: ['', [Validators.required]],
      fileType: ['cobros', [Validators.required]],
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
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSelectedFiles(event: any): void {
    console.log('FILES SELECTED: ', event)
    this.files = event.target.files ?? null;
    this.fileSelected = this.files![0].name.substring(0, this.files![0].name.length - 4);
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
      this.form.value['fileType']
    );
    this.files = null;
    this.form.reset();
  }

  getClients() {
    this.clientService.getClients().subscribe((clients) => {
      this.clients = clients;
    });
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
