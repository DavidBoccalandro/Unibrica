import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  LineChartData,
  PieAdvancedChartData,
  PieChartData,
  VerticalBarChartData,
  XYLabels,
} from '../charts/chart.interfaces';
import { UploadFileModalComponent } from '../shared/modal/upload-file-modal.component';
import { DashboardService } from './dashboard.service';
import { CalendarEvent } from 'angular-calendar';
import { ClientModalComponent } from '../shared/modal/clients/client-modal/client-modal.component';
import { StadisticsService, StatisticsParams2 } from '../stadistics/stadistics.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Client } from '../stadistics/components/clients/clients.interfaces';
import { Payment } from '../stadistics/components/payments/payments/payments.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  lineChartData: LineChartData[] = [];
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

  constructor(
    public dialog: MatDialog,
    private dashboardService: DashboardService,
    private statisticService: StadisticsService,
    private fb: FormBuilder
  ) {
    this.dashboardForm = this.fb.group({
      lineChartForm: this.fb.group({
        selectedClientId: [null],
        start: [null],
        end: [null],
      }),
    });
  }

  ngOnInit(): void {
    this.statisticService
      .getAllClients()
      .pipe(take(1))
      .subscribe((clients) => {
        this.clients = clients;
        const lineChartForm = this.dashboardForm.get('lineChartForm');
        const currentDate = new Date();

        // Setear fechas en el formulario
        lineChartForm
          ?.get('start')
          ?.setValue(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        lineChartForm?.get('end')?.setValue(currentDate);

        // Cargar los pagos de todos los clientes
        this.loadPaymentsForAllClients();
      });
  }

  loadPaymentsForAllClients(): void {
    const { start, end } = this.dashboardForm.get('lineChartForm')!.value;
    if (start && end) {
      const filter: StatisticsParams2 = {
        limit: 0,
        offset: 0,
        dateFilters: [
          {
            filterBy: 'fileDate',
            startDate: start,
            endDate: end,
          },
        ],
      };

      // Obtener pagos de todos los clientes
      this.statisticService.getAllPaymentsWithoutPagination(filter).subscribe((data) => {
        // console.log('payments: ', data.payments);
        this.processPaymentDataForAllClients(data.payments);
      });
    }
  }

  processPaymentDataForAllClients(data: any[]): void {
    const { start, end } = this.dashboardForm.get('lineChartForm')!.value;

    // Generar todas las fechas entre el rango
    const allDates = this.generateDateRange(new Date(start), new Date(end));

    // Agrupar pagos por cliente y fecha
    const groupedData: { [key: string]: { [date: string]: number } } = data.reduce(
      (acc: { [key: string]: { [date: string]: number } }, payment) => {
        const clientId = payment.client.clientId;
        const date = new Date(payment.debitDate).toDateString();

        if (!acc[clientId]) {
          acc[clientId] = {};
        }

        if (!acc[clientId][date]) {
          acc[clientId][date] = 0;
        }

        acc[clientId][date] += payment.chargedAmount;
        return acc;
      },
      {}
    );

    // Crear datos para el gráfico llenando con 0 los días sin registros
    this.lineChartData = Object.keys(groupedData).map((clientId) => {
      const seriesData = allDates.map((date: string) => ({
        name: date,
        value: groupedData[clientId][date] || 0, // Si no hay registro, poner 0
      }));

      return {
        name:
          this.clients.find((client) => client.clientId === Number(clientId))?.name ||
          `Cliente ${clientId}`,
        series: seriesData,
      };
    });
  }

  loadPayments(): void {
    const { selectedClientId, start, end } = this.dashboardForm.get('lineChartForm')!.value;

    if (selectedClientId && start && end) {
      const filter: StatisticsParams2 = {
        limit: 0,
        offset: 0,
        numericFilters: [
          {
            filterBy: 'clientId',
            filterValue: selectedClientId,
            operator: '=',
          },
        ],
        dateFilters: [
          {
            filterBy: 'fileDate',
            startDate: start,
            endDate: end,
          },
        ],
      };

      this.statisticService.getAllPaymentsWithoutPagination(filter).subscribe((data) => {
        this.processPaymentData(data.payments);
      });
    }
  }

  processPaymentData(data: any[]): void {
    const groupedData: { [key: string]: number } = data.reduce(
      (acc: { [key: string]: number }, payment) => {
        const date = new Date(payment.debitDate).toDateString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += payment.chargedAmount;
        return acc;
      },
      {}
    );

    // Formatear lineChartData según la interfaz LineChartData
    this.lineChartData = [
      {
        name: 'Pagos Totales', // Puedes cambiar esto según tus necesidades
        series: Object.keys(groupedData).map((date) => ({
          name: date,
          value: groupedData[date],
        })),
      },
    ];
  }

  generateDateRange(start: Date, end: Date): string[] {
    const dateArray: string[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dateArray.push(new Date(currentDate).toDateString());
      currentDate.setDate(currentDate.getDate() + 1); // Avanzar un día
    }

    return dateArray;
  }

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
}
