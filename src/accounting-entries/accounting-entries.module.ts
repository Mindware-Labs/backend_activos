import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingEntry } from './entities/accounting-entry.entity';
import { AccountingEntriesService } from './accounting-entries.service';
import { AccountingEntriesController } from './accounting-entries.controller';
import { DepreciationCalculation } from '../depreciation-calculations/entities/depreciation-calculation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountingEntry, DepreciationCalculation]),
  ],
  controllers: [AccountingEntriesController],
  providers: [AccountingEntriesService],
})
export class AccountingEntriesModule {}
