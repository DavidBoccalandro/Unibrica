import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileLogComponent } from './file-log.component';

describe('FileLogComponent', () => {
  let component: FileLogComponent;
  let fixture: ComponentFixture<FileLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileLogComponent]
    });
    fixture = TestBed.createComponent(FileLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
