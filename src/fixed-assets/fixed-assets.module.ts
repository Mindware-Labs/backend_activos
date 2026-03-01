import { Module } from '@nestjs/common';
import { FixedAssetsService } from './fixed-assets.service';
import { FixedAssetsController } from './fixed-assets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetType } from '../asset-types/entities/asset-type.entity';
import { Department } from '../departments/entities/department.entity';
import { FixedAsset } from './entities/fixed-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FixedAsset, Department, AssetType])],
  controllers: [FixedAssetsController],
  providers: [FixedAssetsService],
})
export class FixedAssetsModule {}
