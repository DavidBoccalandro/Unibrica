import { BaseEntity } from 'src/config/base.entity';
import { IClient } from 'src/interfaces/client.interfaces';
import { SheetsEntity } from 'src/shared/entities/debtSheets.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'clients' })
export class ClientEntity extends BaseEntity implements IClient {
  @Column()
  clientId: number;

  @Column()
  name: string;

  @OneToMany(() => SheetsEntity, (debtSheet) => debtSheet.client, { nullable: true })
  sheets: SheetsEntity[];
}
