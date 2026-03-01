import { Module } from '@nestjs/common';
import { DepreciationCalculationsService } from './depreciation-calculations.service';
import { DepreciationCalculationsController } from './depreciation-calculations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepreciationCalculation } from './entities/depreciation-calculation.entity';
import { FixedAsset } from '../fixed-assets/entities/fixed-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepreciationCalculation, FixedAsset])],
  controllers: [DepreciationCalculationsController],
  providers: [DepreciationCalculationsService],
})
export class DepreciationCalculationsModule {}
