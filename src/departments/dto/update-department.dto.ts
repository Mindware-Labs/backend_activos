import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDto } from './create-department.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @IsOptional()
  @IsBoolean({
    message: 'El estado del departamento debe ser un valor booleano',
  })
  status?: boolean;
}
