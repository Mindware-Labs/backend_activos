import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AccountingEntriesService } from './accounting-entries.service';
import { CreateAccountingEntryDto } from './dto/create-accounting-entry.dto';

@ApiTags('accounting-entries')
@Controller('accounting-entries')
export class AccountingEntriesController {
  constructor(
    private readonly accountingEntriesService: AccountingEntriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un asiento contable (par DB/CR)' })
  @ApiResponse({ status: 201, description: 'Asiento creado' })
  create(@Body() dto: CreateAccountingEntryDto) {
    return this.accountingEntriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los asientos contables agrupados' })
  @ApiResponse({ status: 200, description: 'Lista de asientos contables' })
  findAll() {
    return this.accountingEntriesService.findAll();
  }

  @Get('depreciation-total/:year/:month')
  @ApiOperation({ summary: 'Obtener total de depreciación de un periodo' })
  @ApiParam({ name: 'year', description: 'Año (YYYY)' })
  @ApiParam({ name: 'month', description: 'Mes (1-12)' })
  @ApiResponse({ status: 200, description: 'Total de depreciación' })
  getDepreciationTotal(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.accountingEntriesService
      .getDepreciationTotal(+year, +month)
      .then((total) => ({ year: +year, month: +month, total }));
  }

  @Delete(':auxiliaryId')
  @ApiOperation({ summary: 'Eliminar un grupo de asientos por auxiliaryId' })
  @ApiParam({ name: 'auxiliaryId', description: 'Identificador del asiento' })
  @ApiResponse({ status: 200, description: 'Asientos eliminados' })
  remove(@Param('auxiliaryId') auxiliaryId: string) {
    return this.accountingEntriesService.remove(auxiliaryId);
  }
}
