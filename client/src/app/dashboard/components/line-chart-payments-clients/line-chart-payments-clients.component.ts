import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Chart, ChartType } from 'chart.js/auto';
import { take } from 'rxjs';
import { XYLabels } from 'src/app/charts/chart.interfaces';
import { ClientModalComponent } from 'src/app/shared/modal/clients/client-modal/client-modal.component';
import { UploadFileModalComponent } from 'src/app/shared/modal/upload-file-modal.component';
import { LisFileService } from 'src/app/shared/utils/generateMockPagba';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
import { Payment } from 'src/app/stadistics/components/payments/payments/payments.component';
import { StadisticsService, StatisticsResponse } from 'src/app/stadistics/stadistics.service';

interface ChartData {
  labels: string[]; // Asumiendo que labels es un array de strings
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
}

@Component({
  selector: 'app-line-chart-payments-clients',
  templateUrl: './line-chart-payments-clients.component.html',
  styleUrls: ['./line-chart-payments-clients.component.scss'],
})
export class LineChartPaymentsClientsComponent {
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
    private statisticService: StadisticsService,
    private fb: FormBuilder,
    private generatePagbaService: LisFileService
  ) {
    this.dashboardForm = this.fb.group({
      lineChartForm: this.fb.group({
        clientName: [null],
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
        // const lineChartForm = this.dashboardForm.get('lineChartForm');

        // Setear fechas en el formulario
        // lineChartForm
        //   ?.get('start')
        //   ?.setValue(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        // lineChartForm?.get('end')?.setValue(currentDate);

        // Cargar los pagos de todos los clientes
        this.loadPaymentsForAllClients();
      });
  }

  loadPaymentsForAllClients(): void {
    const today = this.dashboardForm.get('lineChartForm')!.value.end ?? new Date();
    const start =
      this.dashboardForm.get('lineChartForm')!.value.start ??
      new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const statisticsParam = { startDate: start, endDate: today };
    this.statisticService.getStatisticsOfMonth(statisticsParam).subscribe((data) => {
      if (data.length > 0) {
        const chartData = this.adaptStatisticsToChartData(data);
        if (this.chart) this.chart.destroy();
        console.log('Antes de crear el Chart', chartData);
        this.chart = new Chart('MyChart', {
          type: 'line' as ChartType, //this denotes tha type of chart
          data: chartData, // Asegúrate de que tu variable esté definida correctamente
          options: {
            scales: {
              x: {
                ticks: {
                  autoSkip: true, // Esto permite que se omitan etiquetas automáticamente
                  maxTicksLimit: 5, // Establece el número máximo de etiquetas
                },
              },
            },
          },
        });
      }
    });
  }

  adaptStatisticsToChartData(response: StatisticsResponse[]): ChartData {
    const totalLine = new Map<string, number>();
    const selectedClients = this.dashboardForm.get('lineChartForm')?.value.clientName;
    console.log('Clientes selccionados', selectedClients)

    const responseFiltered = response.filter(client => selectedClients ? selectedClients.includes(client.clientName) : true)

    response.forEach((stat) => {
        console.log('stat: ', stat)
        Object.keys(stat.statistics.totalDebitAmount).forEach((day) => {
          const value = Number(stat.statistics.totalDebitAmount[day]);
          if (totalLine.has(day)) {
            totalLine.set(day, totalLine.get(day)! + value);
          } else {
            totalLine.set(day, value);
          }
        });
      });

    const totalStatistics = Object.fromEntries(totalLine);
    const finalStatistics = [
      ...responseFiltered,
      { clientName: 'Total', statistics: { totalDebitAmount: totalStatistics } },
    ];

    const labels = Object.keys(response[0].statistics.totalDebitAmount);
    return {
      labels: labels,
      datasets: finalStatistics.map((stat, index) => {
        return {
          label: stat.clientName,
          data: labels.map((day: string) => Number(stat.statistics.totalDebitAmount[day])), // Asegurarse de mapear las fechas correctamente
          fill: false,
          borderColor: this.getColorForClient(index),
          tension: 0.2,
        };
      }),
    };
  }

  selectAllClients(): void {
    const allClientNames = this.clients.map(client => client.name);
    this.dashboardForm.get('lineChartForm')?.get('clientName')?.setValue(allClientNames);
  }

  // Deseleccionar todos los clientes
  deselectAllClients(): void {
    this.dashboardForm.get('lineChartForm')?.get('clientName')?.setValue([]);
  }

  onSelectionChange(event: MatSelectChange): void {
    // if (event.value.includes('Total')) {
    //   this.addTotalLine();
    // } else {
    //   this.removeTotalLine();
    // }
  }

  getDaysInMonth(year: number, month: number): string[] {
    const date = new Date(year, month, 1);
    const days: string[] = [];

    while (date.getMonth() === month) {
      days.push(date.toISOString().split('T')[0]); // Formato YYYY-MM-DD
      date.setDate(date.getDate() + 1);
    }

    return days;
  }

  // Función para generar un color para cada cliente (puedes definir tu lógica)
  getColorForClient(index: number): string {
    const colors = [
      '#bb8fce',
      '#85c1e9',
      '#73c6b6',
      '#f5b7b1',
      '#abebc6',
      '#fad7a0',
      '#edbb99',
      '#2980b9',
      '#1abc9c',
    ];
    return colors[index];
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

  generatePagba() {
    this.generatePagbaService.downloadLisFile(10);
  }
}
