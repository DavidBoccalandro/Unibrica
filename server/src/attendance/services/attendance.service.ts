import { Injectable } from '@nestjs/common';
import { AttendanceEntity } from '../entities/attendance.entity';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import { UserEntity } from 'src/users/entities/users.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
  ) {}

  async toggleAttendance(userID: string): Promise<AttendanceEntity> {
    try {
      const userUnfinishedAttendance = await this.attendanceRepository.findOneBy({
        user: { id: userID },
        cycle_finished: false,
      });
      if (userUnfinishedAttendance) {
        const updatedAttendance = await this.attendanceRepository.save({
          cycle_finished: true,
          ...userUnfinishedAttendance,
        });
        return userUnfinishedAttendance;
      }
      console.log(userUnfinishedAttendance);

      const attendance = this.attendanceRepository.create();
      attendance.user = await this.findUser(userID);
      attendance.cycle_finished = false;

      const savedAttendance = await this.attendanceRepository.save(attendance);
      if (!savedAttendance) {
        throw new ErrorManager({ type: 'BAD_REQUEST', message: 'Attendance not created' });
      }
      return savedAttendance;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(userID: string): Promise<AttendanceEntity[]> {
    try {
      const attendances = await this.attendanceRepository.find({ where: { user: { id: userID } } });
      return attendances;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOneByUser(userId: string) {
    try {
      const attendance = await this.attendanceRepository.findOneBy({
        user: { id: userId },
        cycle_finished: false,
      });
      return attendance;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async closeLastAttendance(userId: string): Promise<UpdateResult | undefined> {
    try {
      const lastAttendance = await this.attendanceRepository.findOneBy({
        user: { id: userId },
        cycle_finished: null,
      });
      const updateResult = await this.attendanceRepository.update(lastAttendance, {
        cycle_finished: true,
      });
      if (!updateResult.affected) {
        throw new ErrorManager({ type: 'BAD_REQUEST', message: 'Update Failed' });
      }
      return updateResult;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const deleteResult = await this.attendanceRepository.delete(id);
      if (deleteResult.affected === 0) {
        throw new ErrorManager({ type: 'NOT_FOUND', message: 'Attendance not found' });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async findUser(userID: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: userID });
    if (!user) {
      throw new ErrorManager({ type: 'BAD_REQUEST', message: 'User not found' });
    }
    return user;
  }
}
