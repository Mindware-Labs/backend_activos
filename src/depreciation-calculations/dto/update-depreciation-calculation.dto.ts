import { PartialType } from '@nestjs/mapped-types';
import { CreateDepreciationCalculationDto } from './create-depreciation-calculation.dto';

export class UpdateDepreciationCalculationDto extends PartialType(CreateDepreciationCalculationDto) {}
