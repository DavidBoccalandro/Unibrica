import { ClientEntity } from 'src/clients/entities/clients.entity';
import { BaseEntity } from 'src/config/base.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { Entity, ManyToOne, Column } from 'typeorm';

@Entity('statistics_reversals')
export class StatisticsReversalEntity extends BaseEntity {
  @ManyToOne(() => ClientEntity, (client) => client.reversalStatistics)
  client: ClientEntity;

  @ManyToOne(() => SheetEntity, (sheet) => sheet.reversalStatistics)
  sheet: SheetEntity;

  @Column()
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalReversalAmount: number;
}
