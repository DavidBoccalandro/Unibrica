import { Component, OnInit } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { StadisticsService, StatisticsResponse } from 'src/app/stadistics/stadistics.service';

@Component({
  selector: 'app-efficiency-recovery-chart',
  templateUrl: './efficiency-recovery-chart.component.html',
  styleUrls: ['./efficiency-recovery-chart.component.scss'],
})
export class EfficiencyRecoveryChartComponent implements OnInit {
  view: [number, number] = [1000, 600];

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Clientes';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Monto de pagos';
  animations: boolean = true;
  data: any = [];
  maxValue = 16000000;

  colorScheme: Color = {
    name: 'light',
    selectable: true,
    group: 'linear' as ScaleType,
    domain: ['#CC0000', '#1E4666', '#AAAAAA'],
  };

  constructor(private statisticService: StadisticsService) {}

  ngOnInit(): void {
    this.loadPaymentsForAllClients();
  }

  loadPaymentsForAllClients(): void {
    // const today = this.dashboardForm.get('lineChartForm')!.value.end ?? new Date();
    // const start =
    //   this.dashboardForm.get('lineChartForm')!.value.start ??
    //   new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const statisticsParam = { startDate: start, endDate: today };
    this.statisticService.getStatisticsOfMonth(statisticsParam).subscribe((data) => {
      if (data.length > 0) {
        const chartData = this.adaptStatisticsToChartData(data);
        const maxValueY = this.calculateMaxValueY(chartData);
        this.maxValue = Math.round(maxValueY + (maxValueY * 0.1));
        this.data = chartData;
        console.log('maxValue: ', this.maxValue)
      }
    });
  }

  adaptStatisticsToChartData(data: StatisticsResponse[]) {
    return data.map((clientStats) => {
      // Sumar todos los valores de 'totalDebitAmount' y 'totalRemainingDebt' para cada cliente
      const totalDebitAmountSum = Object.values(clientStats.statistics.totalDebitAmount).reduce(
        (acc: number, value: number) => acc + value,
        0
      );

      const totalRemainingDebtSum = Object.values(clientStats.statistics.totalRemainingDebt).reduce(
        (acc: number, value: number) => acc + value,
        0
      );

      // Retornar en el formato necesario para ngx-charts
      return {
        name: clientStats.clientName, // El nombre del cliente
        series: [
          {
            name: 'Monto cobrado', // Nombre de la serie para el monto cobrado
            value: Number(totalDebitAmountSum), // Suma total de monto cobrado
          },
          {
            name: 'Monto deuda', // Nombre de la serie para la deuda remanente
            value: Number(totalRemainingDebtSum), // Suma total de deuda remanente
          },
        ],
      };
    });
  }

  calculateMaxValueY(data: any[]): number {
    let maxValue = 0;

    data.forEach((clientStats) => {
      // Sumar el monto cobrado y deuda remanente para obtener el total acumulado por cliente
      const totalAmount = clientStats.series.reduce(
        (acc: number, seriesItem: any) => acc + seriesItem.value,
        0
      );

      // Actualizar el valor máximo si el total es mayor
      if (totalAmount > maxValue) {
        maxValue = totalAmount;
      }
    });

    return maxValue;
  }
}
