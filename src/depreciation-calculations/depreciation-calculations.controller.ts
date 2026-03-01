import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DepreciationCalculationsService } from './depreciation-calculations.service';
import { CreateDepreciationCalculationDto } from './dto/create-depreciation-calculation.dto';
import { UpdateDepreciationCalculationDto } from './dto/update-depreciation-calculation.dto';
import { IdvalidationPipe } from '../common/id-validation.pipe';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { RunDepreciationCalculationDto } from './dto/run-depreciation-calculation.dto';

@ApiTags('depreciation-calculations')
@Controller('depreciation-calculations')
export class DepreciationCalculationsController {
  constructor(
    private readonly depreciationCalculationsService: DepreciationCalculationsService,
  ) {}

  @Post('run')
  @ApiOperation({
    summary: 'Ejecutar proceso de cálculo mensual de depreciación',
  })
  @ApiResponse({ status: 201, description: 'Proceso ejecutado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  runMonthlyCalculation(
    @Body() runDepreciationCalculationDto: RunDepreciationCalculationDto,
  ) {
    return this.depreciationCalculationsService.runMonthlyCalculation(
      runDepreciationCalculationDto,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Crear un cálculo de depreciación manual' })
  @ApiResponse({ status: 201, description: 'Cálculo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un cálculo para este período y activo',
  })
  create(
    @Body() createDepreciationCalculationDto: CreateDepreciationCalculationDto,
  ) {
    return this.depreciationCalculationsService.create(
      createDepreciationCalculationDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los cálculos de depreciación (paginado)',
  })
  @ApiResponse({ status: 200, description: 'Lista de cálculos' })
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.depreciationCalculationsService.findAll(paginationQueryDto);
  }

  @Get('period/:year/:month')
  @ApiOperation({ summary: 'Obtener cálculos por período (año y mes)' })
  @ApiParam({ name: 'year', description: 'Año (YYYY)', example: 2024 })
  @ApiParam({ name: 'month', description: 'Mes (1-12)', example: 1 })
  @ApiResponse({ status: 200, description: 'Cálculos del período' })
  findByPeriod(@Param('year') year: string, @Param('month') month: string) {
    return this.depreciationCalculationsService.findByPeriod(+year, +month);
  }

  @Get('year/:year')
  @ApiOperation({ summary: 'Obtener todos los cálculos de un año' })
  @ApiParam({ name: 'year', description: 'Año (YYYY)', example: 2024 })
  @ApiResponse({ status: 200, description: 'Cálculos del año' })
  findByYear(@Param('year') year: string) {
    return this.depreciationCalculationsService.findByYear(+year);
  }

  @Get('fixed-asset/:fixedAssetId')
  @ApiOperation({ summary: 'Obtener histórico de cálculos de un activo fijo' })
  @ApiParam({ name: 'fixedAssetId', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Histórico del activo' })
  findByFixedAsset(
    @Param('fixedAssetId', IdvalidationPipe) fixedAssetId: string,
  ) {
    return this.depreciationCalculationsService.findByFixedAsset(+fixedAssetId);
  }

  @Get('stats/:year/:month')
  @ApiOperation({ summary: 'Obtener estadísticas de depreciación por período' })
  @ApiParam({ name: 'year', description: 'Año (YYYY)', example: 2024 })
  @ApiParam({ name: 'month', description: 'Mes (1-12)', example: 1 })
  @ApiResponse({ status: 200, description: 'Estadísticas del período' })
  getStatsByPeriod(@Param('year') year: string, @Param('month') month: string) {
    return this.depreciationCalculationsService.getStatsByPeriod(+year, +month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cálculo de depreciación por ID' })
  @ApiParam({ name: 'id', description: 'ID del cálculo' })
  @ApiResponse({ status: 200, description: 'Cálculo encontrado' })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  findOne(@Param('id', IdvalidationPipe) id: string) {
    return this.depreciationCalculationsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cálculo de depreciación' })
  @ApiParam({ name: 'id', description: 'ID del cálculo' })
  @ApiResponse({ status: 200, description: 'Cálculo actualizado' })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  update(
    @Param('id', IdvalidationPipe) id: string,
    @Body() updateDepreciationCalculationDto: UpdateDepreciationCalculationDto,
  ) {
    return this.depreciationCalculationsService.update(
      +id,
      updateDepreciationCalculationDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cálculo de depreciación' })
  @ApiParam({ name: 'id', description: 'ID del cálculo' })
  @ApiResponse({ status: 200, description: 'Cálculo eliminado' })
  @ApiResponse({ status: 404, description: 'Cálculo no encontrado' })
  remove(@Param('id', IdvalidationPipe) id: string) {
    return this.depreciationCalculationsService.remove(+id);
  }
}
