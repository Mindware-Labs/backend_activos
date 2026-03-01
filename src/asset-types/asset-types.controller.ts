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
import { AssetTypesService } from './asset-types.service';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';
import { IdvalidationPipe } from '../common/id-validation.pipe';
import { PaginationQueryDto } from 'src/common/pagination-query.dto';

@ApiTags('asset-types')
@Controller('asset-types')
export class AssetTypesController {
  constructor(private readonly assetTypesService: AssetTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de activo' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de activo creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de activo con ese nombre',
  })
  create(@Body() createAssetTypeDto: CreateAssetTypeDto) {
    return this.assetTypesService.create(createAssetTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de activo (paginado)' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de activo' })
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.assetTypesService.findAll(paginationQueryDto);
  }

  @Get('active/list')
  @ApiOperation({ summary: 'Listar solo tipos de activo activos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos activos' })
  findActive() {
    return this.assetTypesService.findActive();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Filtrar tipos de activo por estado' })
  @ApiParam({
    name: 'status',
    description: 'Estado: true o false',
    enum: ['true', 'false'],
  })
  @ApiResponse({ status: 200, description: 'Tipos filtrados por estado' })
  findByStatus(
    @Param('status') status: string,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const isActive = status === 'true';
    return this.assetTypesService.findByStatus(isActive, paginationQueryDto);
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Buscar tipos de activo por nombre o descripción' })
  @ApiParam({ name: 'query', description: 'Texto a buscar' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda' })
  search(@Param('query') query: string) {
    return this.assetTypesService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de activo por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de activo' })
  @ApiResponse({ status: 200, description: 'Tipo de activo encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de activo no encontrado' })
  findOne(@Param('id', IdvalidationPipe) id: string) {
    return this.assetTypesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de activo' })
  @ApiParam({ name: 'id', description: 'ID del tipo de activo' })
  @ApiResponse({ status: 200, description: 'Tipo de activo actualizado' })
  @ApiResponse({ status: 404, description: 'Tipo de activo no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado' })
  update(
    @Param('id', IdvalidationPipe) id: string,
    @Body() updateAssetTypeDto: UpdateAssetTypeDto,
  ) {
    return this.assetTypesService.update(+id, updateAssetTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de activo (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del tipo de activo' })
  @ApiResponse({ status: 200, description: 'Tipo de activo desactivado' })
  @ApiResponse({ status: 404, description: 'Tipo de activo no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede desactivar: tiene activos fijos activos',
  })
  remove(@Param('id', IdvalidationPipe) id: string) {
    return this.assetTypesService.remove(+id);
  }
}
