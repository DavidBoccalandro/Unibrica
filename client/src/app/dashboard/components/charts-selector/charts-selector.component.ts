import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-charts-selector',
  templateUrl: './charts-selector.component.html',
  styleUrls: ['./charts-selector.component.scss']
})
export class ChartsSelectorComponent {
  graphs = [
    {
      title: 'Pagos por cliente',
      imageUrl: '../../../../assets/media/line-chart.png',
      description: 'Representación de los pagos realizados por los clientes cada día en un determinado período de tiempo',
      route: '/dashboard/line-chart'
    },
    {
      title: 'Efectividad de cobro',
      imageUrl: '../../../../assets/media/stacked-bars.jpg',
      description: 'Representa el monto de los pagos realizados y no realizados dando una clara muestra de la efectividad de cobro',
      route: '/dashboard/stacked-chart'
    },
    {
      title: 'Gráfico 3',
      imageUrl: '../../../../assets/media/SITIO-EN-CONSTRUCCION.jpg',
      description: 'Descripción del gráfico 3',
      route: '/grafico3'
    },
    {
      title: 'Gráfico 4',
      imageUrl: '../../../../assets/media/SITIO-EN-CONSTRUCCION.jpg',
      description: 'Descripción del gráfico 4',
      route: '/grafico4'
    }
  ];

  constructor(private router: Router) {}

  navigateToGraph(route: string) {
    this.router.navigate([route]);
  }
}
