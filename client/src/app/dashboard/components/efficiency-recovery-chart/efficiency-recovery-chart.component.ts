import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { take } from 'rxjs';
import { Client } from 'src/app/stadistics/components/clients/clients.interfaces';
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
  legendPosition = 'below' as LegendPosition;

  colorScheme: Color = {
    name: 'light',
    selectable: true,
    group: 'linear' as ScaleType,
    domain: ['#CC0000', '#1E4666', '#AAAAAA'],
  };

  dashboardForm!: FormGroup;
  clients: Client[] = []

  constructor(private statisticService: StadisticsService, private fb: FormBuilder) {
    this.dashboardForm = this.fb.group({
      stackedBarsChartForm: this.fb.group({
        clientName: [null],
        start: [null],
        end: [null],
      }),
    });
  }

  ngOnInit(): void {
    this.statisticService.getAllClients().pipe(take(1)).subscribe((clients) => {
      this.clients = clients;
    });
    this.loadPaymentsForAllClients();
  }

  loadPaymentsForAllClients(): void {
    const today = this.dashboardForm.get('stackedBarsChartForm')!.value.end ?? new Date();
    const start =
      this.dashboardForm.get('stackedBarsChartForm')!.value.start ??
      new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // const today = new Date();
    // const start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const statisticsParam = { startDate: start, endDate: today };
    this.statisticService.getStatisticsOfMonth(statisticsParam).subscribe((data) => {
      if (data.length > 0) {
        const chartData = this.adaptStatisticsToChartData(data);
        const maxValueY = this.calculateMaxValueY(chartData);
        this.maxValue = Math.round(maxValueY + maxValueY * 0.1);
        this.data = chartData;
        this.view = [this.data.length * 300 < 1000 ? this.data.length * 300 : 1000, 600]
      }
    });
  }

  adaptStatisticsToChartData(data: StatisticsResponse[]) {
    const selectedClients = this.dashboardForm.get('stackedBarsChartForm')!.value.clientName;
    if (selectedClients) {
      data = data.filter((client) => selectedClients.includes(client.clientName));
    }

    return data.map((clientStats) => {
      const totalDebitAmountSum = Object.values(clientStats.statistics.totalDebitAmount).reduce(
        (acc: number, value: number) => acc + value,
        0
      );

      const totalRemainingDebtSum = Object.values(clientStats.statistics.totalRemainingDebt).reduce(
        (acc: number, value: number) => acc + value,
        0
      );

      // Calcular el monto total de deuda (cobrado + deuda remanente)
      const totalDebt = totalDebitAmountSum + totalRemainingDebtSum;

      // Calcular la eficacia de cobro
      const collectionEfficiency = totalDebt > 0 ? (totalDebitAmountSum / totalDebt) * 100 : 0;

      return {
        name: clientStats.clientName,
        totalDebitAmountSum: totalDebitAmountSum,
        totalRemainingDebtSum: totalRemainingDebtSum,
        collectionEfficiency: collectionEfficiency.toFixed(2), // Dejar dos decimales
        series: [
          { name: 'Monto cobrado', value: Number(totalDebitAmountSum) },
          { name: 'Monto no cobrado', value: Number(totalRemainingDebtSum) },
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
