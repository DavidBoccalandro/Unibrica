import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsSelectorComponent } from './charts-selector.component';

describe('ChartsSelectorComponent', () => {
  let component: ChartsSelectorComponent;
  let fixture: ComponentFixture<ChartsSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChartsSelectorComponent]
    });
    fixture = TestBed.createComponent(ChartsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
