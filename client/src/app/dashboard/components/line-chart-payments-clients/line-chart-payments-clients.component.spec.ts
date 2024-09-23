import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartPaymentsClientsComponent } from './line-chart-payments-clients.component';

describe('LineChartPaymentsClientsComponent', () => {
  let component: LineChartPaymentsClientsComponent;
  let fixture: ComponentFixture<LineChartPaymentsClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LineChartPaymentsClientsComponent]
    });
    fixture = TestBed.createComponent(LineChartPaymentsClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
