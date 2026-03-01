import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber({}, { message: 'El valor de limit debe ser un número' })
  @IsPositive({ message: 'El valor de limit debe ser un número positivo' })
  @IsOptional()
  take: number;

  @IsNumber({}, { message: 'El valor de skip debe ser un número' })
  @IsPositive({ message: 'El valor de skip debe ser un número positivo' })
  @IsOptional()
  skip: number;
}
