import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BanksService } from 'src/app/core/services/banks.service';
import { ClientsService } from 'src/app/core/services/clients.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { UploadFileService } from 'src/app/core/services/upload-file.service';

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
  templateUrl: './upload-file-modal.component.html',
  styleUrls: ['./upload-file-modal.component.scss'],
})
export class UploadFileModalComponent implements OnInit {
  @Input() fileAccept = '.lis,.xlsx,.xls,.csv,.txt';
  form!: FormGroup;
  files!: FileList | null;
  multipleFilesAccepted = false;
  clients: any[] = [];
  banks: any[] = [];
  selectedClientId!: string;
  selectedBankId!: string;
  userId!: string;

  uploading$ = this.uploadFileService.uploading$;

  constructor(
    public dialogRef: MatDialogRef<UploadFileModalComponent>,
    private fb: FormBuilder,
    private uploadFileService: UploadFileService,
    private clientService: ClientsService,
    private banksService: BanksService,
    private snackBar: NotificationsService
  ) {
    this.form = this.fb.group({
      client: [null, [Validators.required]],
      bank: [null, [Validators.required]],
      fileType: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getClients();
    this.getBanks();

    this.uploading$.subscribe((uploading) => {
      if (uploading) {
        this.snackBar.emitNotification(
          'La información se está procesando. Por favor espere unos minutos a que finalice la carga en la base de datos.',
          'info'
        );
      }
    });
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSelectedFiles(event: any): void {
    this.files = event.target.files ?? null;
  }

  getFilesName() {
    return this.filesLabel;
  }

  get filesLabel(): string {
    if (!this.files?.length) {
      return 'No file selected';
    }
    const filesSelected = this.files?.length;
    switch (filesSelected) {
      case 1:
        return this.files[0].name;
      default:
        return `${this.files.length} files selected`;
    }
  }

  onUploadFiles(): void {
    this.uploadFileService.postUploadDebtSheet(
      this.files!,
      'e1cac08c-145b-469b-ae9d-c1c76d3ff001',
      this.selectedClientId,
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

  getBanks() {
    this.banksService.getBanks().subscribe((banks) => {
      this.banks = banks;
    });
  }
}
