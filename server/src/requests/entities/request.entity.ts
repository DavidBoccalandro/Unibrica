import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';

import { IRequest } from 'src/interfaces/request.interfaces';

import { RequestTypeEntity } from './request-type.entity';
import { UserEntity } from 'src/users/entities/users.entity';
import { RequestStateEntity } from './request-state.entity';
import { IsOptional } from 'class-validator';

@Entity({ name: 'requests' })
export class RequestEntity extends BaseEntity implements IRequest {
  @Column()
  date: string;

  @Column()
  description: string;

  @Column()
  @IsOptional()
  comments?: string;

  @ManyToOne(() => RequestTypeEntity, (type) => type.requests)
  type: RequestTypeEntity;

  @ManyToOne(() => RequestStateEntity, (state) => state.requests)
  state: RequestStateEntity;

  @ManyToOne(() => UserEntity, (user) => user.requests)
  user: UserEntity;
}
