import { RoleEntity } from 'src/roles/entities/roles.entity';
import { BaseEntity } from '../../config/base.entity';
import { IUser } from '../../interfaces/user.interface';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { RequestEntity } from 'src/requests/entities/request.entity';
import { AttendanceEntity } from 'src/attendance/entities/attendance.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity implements IUser {
  @Column()
  firstName: string;
  @Column()
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  dob: string;

  @ManyToOne(() => RoleEntity, (role) => role.user)
  role: RoleEntity;

  @OneToMany(() => RequestEntity, (request) => request.user)
  requests: RequestEntity[];

  @OneToMany(() => AttendanceEntity, (attendance) => attendance.user)
  attendances: AttendanceEntity[];
}
