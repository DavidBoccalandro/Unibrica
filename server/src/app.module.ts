import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.source';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { DebtsModule } from './debts/debts.module';
import { AttemptsModule } from './attempts/attempts.module';
import { ClientsModule } from './clients/clients.module';
import { RequestsModule } from './requests/requests.module';
import { BreaksModule } from './breaks/breaks.module';
import { AttendanceModule } from './attendance/attendance.module';
import { BanksModule } from './banks/banks.module';
import { DebtorsModule } from './debtors/debtors.module';
import { PaymentModule } from './payment/payment.module';
import { ReversalModule } from './reversal/reversal.module';
import { SheetsModule } from './sheets/sheets.module';
import { RepeatedDebtorModule } from './repeated-debtor/repeated-debtor.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuthModule,
    DebtsModule,
    DebtorsModule,
    BanksModule,
    ClientsModule,
    AttemptsModule,
    RequestsModule,
    AttendanceModule,
    BreaksModule,
    PaymentModule,
    ReversalModule,
    SheetsModule,
    RepeatedDebtorModule,
    StatisticsModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
