import { Module } from '@nestjs/common';
import { AssetTypesService } from './asset-types.service';
import { AssetTypesController } from './asset-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetType } from './entities/asset-type.entity';
import { FixedAsset } from '../fixed-assets/entities/fixed-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetType, FixedAsset])],
  controllers: [AssetTypesController],
  providers: [AssetTypesService],
})
export class AssetTypesModule {}
