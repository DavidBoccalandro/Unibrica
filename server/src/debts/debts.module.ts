import { Module } from '@nestjs/common';
import { DebtsController } from './controllers/debts.controller';
import { DebtsService } from './services/debts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './entities/accounts.entity';
import { DebtorEntity } from './entities/debtors.entity';
import { DebtEntity } from './entities/debts.entity';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { UsersModule } from 'src/users/users.module';
import { ClientsModule } from 'src/clients/clients.module';
import { BanksModule } from 'src/banks/banks.module';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { RepeatedDebtorEntity } from 'src/repeated-debtor/entities/repeated-debtor.entity';

@Module({
  imports: [
    MulterModule.register(multerConfig),
    TypeOrmModule.forFeature([
      AccountEntity,
      DebtorEntity,
      DebtEntity,
      SheetEntity,
      RepeatedDebtorEntity,
    ]),
    UsersModule,
    ClientsModule,
    BanksModule,
  ],
  providers: [DebtsService],
  controllers: [DebtsController],
})
export class DebtsModule {}
