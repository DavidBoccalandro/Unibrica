import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../service/client.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
import { take } from 'rxjs';

const MaterialModules = [
  MatDialogModule,
  MatButtonModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatIconModule,
  MatDialogModule,
];

@Component({
  selector: 'app-client-modal',
  templateUrl: './client-modal.component.html',
  standalone: true,
  imports: [CommonModule, ...MaterialModules, ReactiveFormsModule],
  styleUrls: ['./client-modal.component.scss'],
})
export class ClientModalComponent implements OnInit {
  clientForm: FormGroup;
  clients: Client[] = [];
  selectedClientToEdit: Client | undefined = undefined;
  selectedClient: Client | undefined = undefined;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<ClientModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client: any }
  ) {
    this.clientForm = this.fb.group({
      clientId: [data.client ? data.client.clientId : '', Validators.required],
      name: [data.client ? data.client.name : '', Validators.required],
      code: [''],
    });
  }

  ngOnInit(): void {
    this.getClients();
  }

  getClients(): void {
    this.clientService.getClients().subscribe(
      (clients) => {
        this.clients = clients;
      },
      (error) => {
        console.error('Error al cargar clientes', error);
      }
    );
  }

  onClientSelect(): void {
    const clientsFiltered = this.clients.filter(
      (client) => client.agreementNumber === this.selectedClientToEdit?.agreementNumber
    );
    this.selectedClient =
      clientsFiltered.length > 1
        ? clientsFiltered.find((client) => client.code === this.selectedClientToEdit!.code)
        : clientsFiltered[0];
    if (this.selectedClient) {
      this.clientForm.patchValue({
        clientId: this.selectedClient.agreementNumber,
        name: this.selectedClient.name,
        code: this.selectedClient.code,
      });
    }
  }

  onEditClient(): void {
    if (this.selectedClientToEdit) {
      this.onClientSelect();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.clientForm.valid) {
      if (this.selectedClient === null || this.selectedClient === undefined) {
        this.clientService.createClient(this.clientForm.value).pipe(take(1)).subscribe();
      } else {
        this.clientService
          .updateClient(this.clientForm.value, this.clientForm.value.clientId)
          .pipe(take(1))
          .subscribe();
      }
      this.dialogRef.close(this.clientForm.value);
    }
  }
}
