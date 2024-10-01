import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartReversalsClientsComponent } from './line-chart-reversals-clients.component';

describe('LineChartReversalsClientsComponent', () => {
  let component: LineChartReversalsClientsComponent;
  let fixture: ComponentFixture<LineChartReversalsClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LineChartReversalsClientsComponent]
    });
    fixture = TestBed.createComponent(LineChartReversalsClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
