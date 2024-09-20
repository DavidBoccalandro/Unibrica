import { Component, Input } from '@angular/core';
import { LineChartData, Scheme, XYLabels } from '../../chart.interfaces';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent {
  @Input() labels!: XYLabels;
  @Input() data!: LineChartData[];
  @Input() view!: [number, number];
  @Input() colorScheme: Scheme = 'vivid';
  defaultView!: [number, number];
}
