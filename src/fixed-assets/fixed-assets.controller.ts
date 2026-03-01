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
import { FixedAssetsService } from './fixed-assets.service';
import { CreateFixedAssetDto } from './dto/create-fixed-asset.dto';
import { UpdateFixedAssetDto } from './dto/update-fixed-asset.dto';
import { IdvalidationPipe } from '../common/id-validation.pipe';
import { PaginationQueryDto } from 'src/common/pagination-query.dto';

@ApiTags('fixed-assets')
@Controller('fixed-assets')
export class FixedAssetsController {
  constructor(private readonly fixedAssetsService: FixedAssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo activo fijo' })
  @ApiResponse({ status: 201, description: 'Activo fijo creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, departamento o tipo de activo inactivo',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento o tipo de activo no encontrado',
  })
  create(@Body() createFixedAssetDto: CreateFixedAssetDto) {
    return this.fixedAssetsService.create(createFixedAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los activos fijos (paginado)' })
  @ApiResponse({ status: 200, description: 'Lista de activos fijos' })
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.fixedAssetsService.findAll(paginationQueryDto);
  }

  @Get('active/list')
  @ApiOperation({ summary: 'Listar solo activos fijos activos' })
  @ApiResponse({ status: 200, description: 'Lista de activos activos' })
  findActive() {
    return this.fixedAssetsService.findActive();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Filtrar activos fijos por estado' })
  @ApiParam({
    name: 'status',
    description: 'Estado: true o false',
    enum: ['true', 'false'],
  })
  @ApiResponse({ status: 200, description: 'Activos filtrados por estado' })
  findByStatus(
    @Param('status') status: string,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const isActive = status === 'true';
    return this.fixedAssetsService.findByStatus(isActive, paginationQueryDto);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Filtrar activos fijos por departamento' })
  @ApiParam({ name: 'departmentId', description: 'ID del departamento' })
  @ApiResponse({ status: 200, description: 'Activos del departamento' })
  findByDepartment(
    @Param('departmentId', IdvalidationPipe) departmentId: string,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    return this.fixedAssetsService.findByDepartment(
      +departmentId,
      paginationQueryDto,
    );
  }

  @Get('summary/depreciation')
  @ApiOperation({
    summary: 'Obtener resumen de depreciación de todos los activos',
  })
  @ApiResponse({ status: 200, description: 'Resumen de depreciación' })
  getDepreciationSummary() {
    return this.fixedAssetsService.getDepreciationSummary();
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Buscar activos fijos por nombre o descripción' })
  @ApiParam({ name: 'query', description: 'Texto a buscar' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda' })
  search(@Param('query') query: string) {
    return this.fixedAssetsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un activo fijo por ID' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Activo fijo encontrado' })
  @ApiResponse({ status: 404, description: 'Activo fijo no encontrado' })
  findOne(@Param('id', IdvalidationPipe) id: string) {
    return this.fixedAssetsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un activo fijo' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Activo fijo actualizado' })
  @ApiResponse({ status: 404, description: 'Activo fijo no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Departamento o tipo de activo inactivo',
  })
  update(
    @Param('id', IdvalidationPipe) id: string,
    @Body() updateFixedAssetDto: UpdateFixedAssetDto,
  ) {
    return this.fixedAssetsService.update(+id, updateFixedAssetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un activo fijo (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del activo fijo' })
  @ApiResponse({ status: 200, description: 'Activo fijo desactivado' })
  @ApiResponse({ status: 404, description: 'Activo fijo no encontrado' })
  remove(@Param('id', IdvalidationPipe) id: string) {
    return this.fixedAssetsService.remove(+id);
  }
}
