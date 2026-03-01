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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { IdvalidationPipe } from 'src/common/id-validation.pipe';
import { PaginationQueryDto } from 'src/common/pagination-query.dto';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o departamento inactivo',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un empleado con esa cédula',
  })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados (paginado)' })
  @ApiResponse({ status: 200, description: 'Lista de empleados' })
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.employeesService.findAll(paginationQueryDto);
  }

  @Get('active/list')
  @ApiOperation({ summary: 'Listar solo empleados activos' })
  @ApiResponse({ status: 200, description: 'Lista de empleados activos' })
  findActive() {
    return this.employeesService.findActive();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Filtrar empleados por estado' })
  @ApiParam({
    name: 'status',
    description: 'Estado: true o false',
    enum: ['true', 'false'],
  })
  @ApiResponse({ status: 200, description: 'Empleados filtrados por estado' })
  findByStatus(
    @Param('status') status: string,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const isActive = status === 'true';
    return this.employeesService.findByStatus(isActive, paginationQueryDto);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Filtrar empleados por departamento' })
  @ApiParam({ name: 'departmentId', description: 'ID del departamento' })
  @ApiResponse({ status: 200, description: 'Empleados del departamento' })
  findByDepartment(
    @Param('departmentId', IdvalidationPipe) departmentId: string,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    return this.employeesService.findByDepartment(
      +departmentId,
      paginationQueryDto,
    );
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Buscar empleados por nombre o cédula' })
  @ApiParam({ name: 'query', description: 'Texto a buscar' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda' })
  search(@Param('query') query: string) {
    return this.employeesService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  findOne(@Param('id', IdvalidationPipe) id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({ status: 200, description: 'Empleado actualizado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @ApiResponse({ status: 400, description: 'Departamento inactivo' })
  update(
    @Param('id', IdvalidationPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un empleado (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({ status: 200, description: 'Empleado desactivado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  remove(@Param('id', IdvalidationPipe) id: string) {
    return this.employeesService.remove(+id);
  }
}
