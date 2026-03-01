import { PartialType } from '@nestjs/mapped-types';
import { CreateFixedAssetDto } from './create-fixed-asset.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFixedAssetDto extends PartialType(CreateFixedAssetDto) {
  @IsOptional()
  @IsBoolean({
    message: 'El estado del activo fijo debe ser un valor booleano',
  })
  status?: boolean;
}
