import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepreciationCalculationDto } from './dto/create-depreciation-calculation.dto';
import { UpdateDepreciationCalculationDto } from './dto/update-depreciation-calculation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DepreciationCalculation } from './entities/depreciation-calculation.entity';
import { DataSource, Repository } from 'typeorm';
import { FixedAsset } from '../fixed-assets/entities/fixed-asset.entity';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { RunDepreciationCalculationDto } from './dto/run-depreciation-calculation.dto';

@Injectable()
export class DepreciationCalculationsService {
  constructor(
    @InjectRepository(DepreciationCalculation)
    private readonly depreciationCalculationRepository: Repository<DepreciationCalculation>,

    @InjectRepository(FixedAsset)
    private readonly fixedAssetRepository: Repository<FixedAsset>,

    private readonly dataSource: DataSource,
  ) {}

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private getDefaultProcessDate(year: number, month: number): Date {
    return new Date(Date.UTC(year, month, 0));
  }

  private shouldSkipByDate(
    registrationDate: Date,
    processDate: Date,
    processYear: number,
    processMonth: number,
  ): boolean {
    const registrationYear = registrationDate.getUTCFullYear();
    const registrationMonth = registrationDate.getUTCMonth() + 1;

    if (registrationDate > processDate) {
      return true;
    }

    if (registrationYear > processYear) {
      return true;
    }

    return registrationYear === processYear && registrationMonth > processMonth;
  }

  async create(
    createDepreciationCalculationDto: CreateDepreciationCalculationDto,
  ) {
    const { fixedAssetId, ...depreciationCalculationData } =
      createDepreciationCalculationDto;

    const fixedAsset = await this.fixedAssetRepository.findOneBy({
      id: fixedAssetId,
    });

    if (!fixedAsset) {
      throw new NotFoundException(
        `El activo fijo con ID ${fixedAssetId} no existe.`,
      );
    }

    const existingPeriod =
      await this.depreciationCalculationRepository.findOneBy({
        fixedAssetId,
        processYear: createDepreciationCalculationDto.processYear,
        processMonth: createDepreciationCalculationDto.processMonth,
      });

    if (existingPeriod) {
      throw new ConflictException(
        `Ya existe una depreciacion para el activo fijo ${fixedAssetId} en ${createDepreciationCalculationDto.processYear}-${createDepreciationCalculationDto.processMonth}.`,
      );
    }

    const savedCalculation = await this.depreciationCalculationRepository.save({
      ...depreciationCalculationData,
      fixedAsset,
    });

    fixedAsset.accumulatedDepreciation =
      createDepreciationCalculationDto.accumulatedDepreciation;
    await this.fixedAssetRepository.save(fixedAsset);

    return savedCalculation;
  }

  async runMonthlyCalculation(
    runDepreciationCalculationDto: RunDepreciationCalculationDto,
  ) {
    const { processYear, processMonth } = runDepreciationCalculationDto;
    const processDate = runDepreciationCalculationDto.processDate
      ? new Date(runDepreciationCalculationDto.processDate)
      : this.getDefaultProcessDate(processYear, processMonth);

    return this.dataSource.transaction(async (manager) => {
      const fixedAssetRepository = manager.getRepository(FixedAsset);
      const depreciationCalculationRepository = manager.getRepository(
        DepreciationCalculation,
      );

      const fixedAssets = await fixedAssetRepository.find({
        relations: {
          assetType: true,
        },
        order: {
          id: 'ASC',
        },
      });

      const existingCalculations = await depreciationCalculationRepository.find(
        {
          where: {
            processYear,
            processMonth,
          },
          select: {
            fixedAssetId: true,
          },
        },
      );

      const existingFixedAssetIds = new Set(
        existingCalculations.map((calculation) => calculation.fixedAssetId),
      );

      const skippedAssets: Array<{ fixedAssetId: number; reason: string }> = [];
      const createdCalculations: DepreciationCalculation[] = [];
      let totalAmountDepreciated = 0;

      for (const fixedAsset of fixedAssets) {
        if (existingFixedAssetIds.has(fixedAsset.id)) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'Ya existe depreciacion para este activo en el periodo',
          });
          continue;
        }

        if (!fixedAsset.status) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'El activo fijo esta inactivo',
          });
          continue;
        }

        if (!fixedAsset.assetType) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'El activo no tiene un tipo de activo asociado',
          });
          continue;
        }

        if (
          this.shouldSkipByDate(
            new Date(fixedAsset.registrationDate),
            processDate,
            processYear,
            processMonth,
          )
        ) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'El activo aun no entra en depreciacion para este periodo',
          });
          continue;
        }

        const purchaseValue = Number(fixedAsset.purchaseValue ?? 0);
        const residualValue = Number(fixedAsset.residualValue ?? 0);
        const usefulLifeMonths = Number(fixedAsset.usefulLifeMonths ?? 0);
        const currentAccumulated = Number(
          fixedAsset.accumulatedDepreciation ?? 0,
        );

        if (!Number.isFinite(purchaseValue) || purchaseValue <= 0) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'El valor de compra no es valido para depreciacion',
          });
          continue;
        }

        if (!Number.isFinite(residualValue) || residualValue < 0) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'El valor residual no es valido para depreciacion',
          });
          continue;
        }

        if (!Number.isInteger(usefulLifeMonths) || usefulLifeMonths <= 0) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'La vida util en meses no es valida para depreciacion',
          });
          continue;
        }

        const baseDepreciable = this.roundCurrency(
          purchaseValue - residualValue,
        );
        if (baseDepreciable <= 0) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'La base depreciable debe ser mayor que cero',
          });
          continue;
        }

        const remainingAmount = this.roundCurrency(
          baseDepreciable - currentAccumulated,
        );
        if (remainingAmount <= 0) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'El activo ya alcanzo su depreciacion acumulada maxima',
          });
          continue;
        }

        if (
          !fixedAsset.assetType.purchaseAccount ||
          !fixedAsset.assetType.depreciationAccount
        ) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'Faltan cuentas contables en el tipo de activo',
          });
          continue;
        }

        const monthlyDepreciation = this.roundCurrency(
          baseDepreciable / usefulLifeMonths,
        );

        if (monthlyDepreciation <= 0) {
          skippedAssets.push({
            fixedAssetId: fixedAsset.id,
            reason: 'La depreciacion mensual calculada no es valida',
          });
          continue;
        }

        const amountDepreciation = this.roundCurrency(
          Math.min(monthlyDepreciation, remainingAmount),
        );
        const accumulatedDepreciation = this.roundCurrency(
          currentAccumulated + amountDepreciation,
        );

        const savedCalculation = await depreciationCalculationRepository.save({
          processYear,
          processMonth,
          processDate,
          amountDepreciation,
          accumulatedDepreciation,
          purchaseAccount: fixedAsset.assetType.purchaseAccount,
          depreciationAccount: fixedAsset.assetType.depreciationAccount,
          fixedAssetId: fixedAsset.id,
        });

        await fixedAssetRepository.update(fixedAsset.id, {
          accumulatedDepreciation,
        });

        createdCalculations.push(savedCalculation);
        totalAmountDepreciated = this.roundCurrency(
          totalAmountDepreciated + amountDepreciation,
        );
      }

      return {
        processYear,
        processMonth,
        processDate: processDate.toISOString().split('T')[0],
        totalAssetsEvaluated: fixedAssets.length,
        totalCalculationsCreated: createdCalculations.length,
        totalAssetsSkipped: skippedAssets.length,
        totalAmountDepreciated,
        skippedAssets,
      };
    });
  }

  async findAll({ take, skip }: PaginationQueryDto) {
    const [results, total] =
      await this.depreciationCalculationRepository.findAndCount({
        relations: { fixedAsset: true },
        take,
        skip,
        order: { processYear: 'DESC', processMonth: 'DESC', id: 'DESC' },
      });
    return {
      data: results,
      total,
    };
  }

  async findByPeriod(year: number, month: number) {
    return this.depreciationCalculationRepository.find({
      where: { processYear: year, processMonth: month },
      relations: { fixedAsset: { department: true, assetType: true } },
      order: { id: 'ASC' },
    });
  }

  async findByYear(year: number) {
    return this.depreciationCalculationRepository.find({
      where: { processYear: year },
      relations: { fixedAsset: { department: true, assetType: true } },
      order: { processMonth: 'ASC', id: 'ASC' },
    });
  }

  async findByFixedAsset(fixedAssetId: number) {
    return this.depreciationCalculationRepository.find({
      where: { fixedAssetId },
      relations: { fixedAsset: true },
      order: { processYear: 'DESC', processMonth: 'DESC' },
    });
  }

  async getStatsByPeriod(year: number, month: number) {
    const result = await this.depreciationCalculationRepository
      .createQueryBuilder('dc')
      .select('SUM(dc.amountDepreciation)', 'totalDepreciation')
      .addSelect('COUNT(dc.id)', 'totalCalculations')
      .where('dc.processYear = :year', { year })
      .andWhere('dc.processMonth = :month', { month })
      .getRawOne();

    return {
      year,
      month,
      totalDepreciation: parseFloat(result.totalDepreciation || '0'),
      totalCalculations: parseInt(result.totalCalculations || '0', 10),
    };
  }

  async findOne(id: number) {
    const depreciationCalculation =
      await this.depreciationCalculationRepository.findOneBy({ id });
    if (!depreciationCalculation) {
      throw new NotFoundException(`La depreciacion con ID ${id} no existe.`);
    }
    return depreciationCalculation;
  }

  async update(
    id: number,
    updateDepreciationCalculationDto: UpdateDepreciationCalculationDto,
  ) {
    const depreciationCalculation = await this.findOne(id);

    if (updateDepreciationCalculationDto.fixedAssetId) {
      const fixedAsset = await this.fixedAssetRepository.findOneBy({
        id: updateDepreciationCalculationDto.fixedAssetId,
      });

      if (!fixedAsset) {
        throw new NotFoundException(
          `El activo fijo con ID ${updateDepreciationCalculationDto.fixedAssetId} no existe.`,
        );
      }

      depreciationCalculation.fixedAsset = fixedAsset;
    }

    Object.assign(depreciationCalculation, updateDepreciationCalculationDto);

    return this.depreciationCalculationRepository.save(depreciationCalculation);
  }

  async remove(id: number) {
    const depreciationCalculation = await this.findOne(id);
    await this.depreciationCalculationRepository.remove(
      depreciationCalculation,
    );
    return { message: `La depreciacion con ID ${id} ha sido eliminada.` };
  }
}
