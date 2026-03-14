import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountingEntry } from './entities/accounting-entry.entity';
import { CreateAccountingEntryDto } from './dto/create-accounting-entry.dto';
import { DepreciationCalculation } from '../depreciation-calculations/entities/depreciation-calculation.entity';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

@Injectable()
export class AccountingEntriesService {
  constructor(
    @InjectRepository(AccountingEntry)
    private readonly accountingEntryRepository: Repository<AccountingEntry>,

    @InjectRepository(DepreciationCalculation)
    private readonly depreciationCalculationRepository: Repository<DepreciationCalculation>,
  ) {}

  private generateAuxiliaryId(year: number, month: number): string {
    const ts = Date.now();
    return `AF-${year}-${String(month).padStart(2, '0')}-${ts}`;
  }

  async getDepreciationTotal(year: number, month: number) {
    const result = await this.depreciationCalculationRepository
      .createQueryBuilder('dc')
      .select('SUM(dc.amountDepreciation)', 'total')
      .where('dc.processYear = :year', { year })
      .andWhere('dc.processMonth = :month', { month })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  async create(dto: CreateAccountingEntryDto): Promise<AccountingEntry[]> {
    const { year, month } = dto;

    const monthStr = String(month).padStart(2, '0');
    const existingDescription = `Asiento de Activos Fijos correspondiente al periodo ${year}-${monthStr}`;
    const existing = await this.accountingEntryRepository.findOne({
      where: { description: existingDescription },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un asiento contable para ${MONTH_NAMES[month - 1]} ${year}.`,
      );
    }

    const amount = await this.getDepreciationTotal(year, month);

    if (amount <= 0) {
      throw new BadRequestException(
        `No hay depreciaciones registradas para ${MONTH_NAMES[month - 1]} ${year}.`,
      );
    }
    const auxiliaryId = this.generateAuxiliaryId(year, month);
    const description = `Asiento de Activos Fijos correspondiente al periodo ${year}-${monthStr}`;

    const debitEntry = this.accountingEntryRepository.create({
      auxiliaryId,
      description,
      inventoryTypeId: 8,
      accountId: 65,
      accountName: 'Gasto depreciación Activos Fijos',
      movementType: 'DB',
      amount,
      date: new Date(),
      status: true,
    });

    const creditEntry = this.accountingEntryRepository.create({
      auxiliaryId,
      description,
      inventoryTypeId: 8,
      accountId: 66,
      accountName: 'Depreciación Acumulada Activos Fijos',
      movementType: 'CR',
      amount,
      date: new Date(),
      status: true,
    });

    return this.accountingEntryRepository.save([debitEntry, creditEntry]);
  }

  async findAll() {
    const entries = await this.accountingEntryRepository.find({
      order: { createdAt: 'DESC', id: 'ASC' },
    });

    // Agrupar por auxiliaryId
    const grouped = new Map<string, AccountingEntry[]>();
    for (const entry of entries) {
      const group = grouped.get(entry.auxiliaryId) ?? [];
      group.push(entry);
      grouped.set(entry.auxiliaryId, group);
    }

    return Array.from(grouped.entries()).map(([auxiliaryId, items]) => ({
      auxiliaryId,
      description: items[0].description,
      inventoryTypeId: items[0].inventoryTypeId,
      date: items[0].date,
      status: items[0].status,
      entries: items,
    }));
  }

  async remove(auxiliaryId: string) {
    const entries = await this.accountingEntryRepository.find({
      where: { auxiliaryId },
    });

    if (entries.length === 0) {
      throw new NotFoundException(
        `No se encontraron asientos con ID ${auxiliaryId}`,
      );
    }

    await this.accountingEntryRepository.remove(entries);
    return { deleted: entries.length };
  }
}
