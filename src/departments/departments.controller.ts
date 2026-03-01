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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { IdvalidationPipe } from '../common/id-validation.pipe';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  @ApiResponse({ status: 201, description: 'Departamento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un departamento con ese nombre',
  })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los departamentos (paginado)' })
  @ApiResponse({ status: 200, description: 'Lista de departamentos' })
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.departmentsService.findAll(paginationQueryDto);
  }

  @Get('active/list')
  @ApiOperation({ summary: 'Listar solo departamentos activos' })
  @ApiResponse({ status: 200, description: 'Lista de departamentos activos' })
  findActive() {
    return this.departmentsService.findActive();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Filtrar departamentos por estado' })
  @ApiParam({
    name: 'status',
    description: 'Estado: true o false',
    enum: ['true', 'false'],
  })
  @ApiResponse({
    status: 200,
    description: 'Departamentos filtrados por estado',
  })
  findByStatus(
    @Param('status') status: string,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const isActive = status === 'true';
    return this.departmentsService.findByStatus(isActive, paginationQueryDto);
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Buscar departamentos por nombre o descripción' })
  @ApiParam({ name: 'query', description: 'Texto a buscar' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda' })
  search(@Param('query') query: string) {
    return this.departmentsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un departamento por ID' })
  @ApiParam({ name: 'id', description: 'ID del departamento' })
  @ApiResponse({ status: 200, description: 'Departamento encontrado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  findOne(@Param('id', IdvalidationPipe) id: string) {
    return this.departmentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un departamento' })
  @ApiParam({ name: 'id', description: 'ID del departamento' })
  @ApiResponse({ status: 200, description: 'Departamento actualizado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado' })
  update(
    @Param('id', IdvalidationPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(+id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un departamento (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del departamento' })
  @ApiResponse({ status: 200, description: 'Departamento desactivado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede desactivar: tiene registros dependientes activos',
  })
  remove(@Param('id', IdvalidationPipe) id: string) {
    return this.departmentsService.remove(+id);
  }
}
