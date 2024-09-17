import { Component, Inject } from '@angular/core';
import { FilesService } from '../../services/files.service';
import { Debtor } from 'src/app/stadistics/components/debtors/debtors.interface';
import { File } from '../files/files.component';
import { BehaviorSubject, take } from 'rxjs';
import { StatisticsParams2 } from 'src/app/stadistics/stadistics.service';
import { UploadFileService } from 'src/app/core/services/upload-file.service';

export interface RepeatedDebtor {
  id: string;
  debtor: Debtor;
  sheets: File[];
}

@Component({
  selector: 'app-file-log',
  templateUrl: './file-log.component.html',
  styleUrls: ['./file-log.component.scss'],
})
export class FileLogComponent {
  repeatedDebtors: RepeatedDebtor[] = [];
  params = new BehaviorSubject<StatisticsParams2>({
    limit: 20,
    offset: 0,
  });
  $params = this.params.asObservable();
  totalItems = 0;

  constructor(private filesService: FilesService, private uploadFileService: UploadFileService) {}

  ngOnInit() {
    this.getRepeatedDebtors();
    this.uploadFileService.uploadSuccess$.subscribe((data) => {
      if (data) {
        this.getRepeatedDebtors();
        this.uploadFileService.resetUploadSuccessSubject();
      }
    });
  }

  getRepeatedDebtors() {
    this.filesService
      .getAllRepeatedDebtors(this.params.getValue())
      .pipe(take(1))
      .subscribe((data: { totalItems: number; repeatedDebtors: RepeatedDebtor[] }) => {
        // console.log('Repeated Debtors: ', data);
        this.totalItems = data.totalItems;
        this.repeatedDebtors = data.repeatedDebtors;
      });
  }
}
