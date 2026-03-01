import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetTypeDto } from './create-asset-type.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAssetTypeDto extends PartialType(CreateAssetTypeDto) {
  @IsOptional()
  @IsBoolean({
    message: 'El estado del departamento debe ser un valor booleano',
  })
  status?: boolean;
}
