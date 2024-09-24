import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyRecoveryChartComponent } from './efficiency-recovery-chart.component';

describe('EfficiencyRecoveryChartComponent', () => {
  let component: EfficiencyRecoveryChartComponent;
  let fixture: ComponentFixture<EfficiencyRecoveryChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EfficiencyRecoveryChartComponent]
    });
    fixture = TestBed.createComponent(EfficiencyRecoveryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
