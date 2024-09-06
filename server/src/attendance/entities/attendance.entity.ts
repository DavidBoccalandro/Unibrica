import { Exclude, Expose } from 'class-transformer';
import { BaseEntity } from 'src/config/base.entity';
import { IAttendance } from 'src/interfaces/attendance.interface';
import { UserEntity } from 'src/users/entities/users.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, Timestamp } from 'typeorm';

@Entity({ name: 'attendances' })
export class AttendanceEntity extends BaseEntity implements IAttendance {
  @Column()
  cycle_finished: boolean;

  @ManyToOne(() => UserEntity, (user) => user.attendances)
  @Exclude()
  user: UserEntity;
}
