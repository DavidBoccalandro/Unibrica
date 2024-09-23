import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { XYLabels } from '../charts/chart.interfaces';
import { UploadFileModalComponent } from '../shared/modal/upload-file-modal.component';
import { ClientModalComponent } from '../shared/modal/clients/client-modal/client-modal.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Client } from '../stadistics/components/clients/clients.interfaces';
import { Payment } from '../stadistics/components/payments/payments/payments.component';
import { Chart } from 'chart.js/auto';
import { LisFileService } from '../shared/utils/generateMockPagba';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  lineChartData: any[] = [];
  lineChartLabels: XYLabels = {
    xAxisLabel: 'Fecha',
    yAxisLabel: 'Monto Total',
    title: 'Clientes',
  };
  // pieChartData!: PieChartData;
  // pieAdvancedChartData!: PieAdvancedChartData;
  // verticalBarChartData!: VerticalBarChartData;

  paymentData: Payment[] = []; // To store the payments data
  clients: Client[] = [];
  dashboardForm!: FormGroup;
  view: [number, number] = [1000, 500];
  chart!: Chart;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private generatePagbaService: LisFileService
  ) {
    this.dashboardForm = this.fb.group({
      lineChartForm: this.fb.group({
        selectedClientId: [null],
        start: [null],
        end: [null],
      }),
    });
  }

  ngOnInit(): void { }

  openDialog(): void {
    const dialogRef = this.dialog.open(UploadFileModalComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openClientModal(client = null): void {
    const dialogRef = this.dialog.open(ClientModalComponent, {
      width: '400px',
      data: { client },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (client) {
          // Lógica para editar el cliente existente
          console.log('Cliente actualizado', result);
        } else {
          // Lógica para crear un nuevo cliente
          console.log('Nuevo cliente creado', result);
        }
      }
    });
  }

  generatePagba() {
    this.generatePagbaService.downloadLisFile(10);
  }
}
