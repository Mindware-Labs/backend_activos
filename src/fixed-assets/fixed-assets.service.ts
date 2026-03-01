import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFixedAssetDto } from './dto/create-fixed-asset.dto';
import { UpdateFixedAssetDto } from './dto/update-fixed-asset.dto';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FixedAsset } from './entities/fixed-asset.entity';
import { Repository } from 'typeorm';
import { Department } from '../departments/entities/department.entity';
import { AssetType } from '../asset-types/entities/asset-type.entity';

@Injectable()
export class FixedAssetsService {
  constructor(
    @InjectRepository(FixedAsset)
    private readonly fixedAssetRepository: Repository<FixedAsset>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,
  ) {}

  async create(createFixedAssetDto: CreateFixedAssetDto) {
    const { departmentId, assetTypeId, ...fixedAssetData } =
      createFixedAssetDto;

    const department = await this.departmentRepository.findOneBy({
      id: departmentId,
    });

    if (!department) {
      throw new NotFoundException(
        `Departamento con ID ${departmentId} no encontrado`,
      );
    }

    if (!department.status) {
      throw new BadRequestException(
        `El Departamento con ID ${departmentId} está inactivo`,
      );
    }

    const assetType = await this.assetTypeRepository.findOneBy({
      id: assetTypeId,
    });

    if (!assetType) {
      throw new NotFoundException(
        `Tipo de activo con ID ${assetTypeId} no encontrado`,
      );
    }

    if (!assetType.status) {
      throw new BadRequestException(
        `El Tipo de activo con ID ${assetTypeId} está inactivo`,
      );
    }

    return this.fixedAssetRepository.save({
      ...fixedAssetData,
      department,
      assetType,
    });
  }

  async findAll({ take, skip }: PaginationQueryDto) {
    const [fixedAssets, total] = await this.fixedAssetRepository.findAndCount({
      take,
      skip,
      relations: {
        department: true,
        assetType: true,
      },
      order: { id: 'ASC' },
    });
    return { data: fixedAssets, total };
  }

  async findActive() {
    return this.fixedAssetRepository.find({
      where: { status: true },
      relations: {
        department: true,
        assetType: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: boolean, paginationQuery: PaginationQueryDto) {
    const { take = 10, skip = 0 } = paginationQuery;
    const [fixedAssets, total] = await this.fixedAssetRepository.findAndCount({
      where: { status },
      relations: {
        department: true,
        assetType: true,
      },
      take,
      skip,
      order: { id: 'ASC' },
    });

    return {
      data: fixedAssets,
      total,
    };
  }

  async findByDepartment(
    departmentId: number,
    paginationQuery: PaginationQueryDto,
  ) {
    const { take = 10, skip = 0 } = paginationQuery;
    const [fixedAssets, total] = await this.fixedAssetRepository.findAndCount({
      where: { departmentId },
      relations: {
        department: true,
        assetType: true,
      },
      take,
      skip,
      order: { id: 'ASC' },
    });

    return {
      data: fixedAssets,
      total,
    };
  }

  async getDepreciationSummary() {
    const result = await this.fixedAssetRepository
      .createQueryBuilder('fa')
      .select('SUM(fa.purchaseValue)', 'totalPurchaseValue')
      .addSelect('SUM(fa.residualValue)', 'totalResidualValue')
      .addSelect(
        'SUM(fa.accumulatedDepreciation)',
        'totalAccumulatedDepreciation',
      )
      .addSelect('COUNT(fa.id)', 'totalAssets')
      .where('fa.status = :status', { status: true })
      .getRawOne();

    return {
      totalPurchaseValue: parseFloat(result.totalPurchaseValue || '0'),
      totalResidualValue: parseFloat(result.totalResidualValue || '0'),
      totalAccumulatedDepreciation: parseFloat(
        result.totalAccumulatedDepreciation || '0',
      ),
      totalAssets: parseInt(result.totalAssets || '0', 10),
    };
  }

  async search(query: string) {
    return this.fixedAssetRepository
      .createQueryBuilder('fixedAsset')
      .leftJoinAndSelect('fixedAsset.department', 'department')
      .leftJoinAndSelect('fixedAsset.assetType', 'assetType')
      .where('LOWER(fixedAsset.name) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(fixedAsset.description) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('fixedAsset.name', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const fixedAsset = await this.fixedAssetRepository.findOne({
      where: { id },
      relations: {
        department: true,
        assetType: true,
      },
    });
    if (!fixedAsset) {
      throw new NotFoundException(`Activo fijo con ID ${id} no encontrado`);
    }
    return fixedAsset;
  }

  async update(id: number, updateFixedAssetDto: UpdateFixedAssetDto) {
    const fixedAsset = await this.findOne(id);

    if (updateFixedAssetDto.departmentId) {
      const department = await this.departmentRepository.findOneBy({
        id: updateFixedAssetDto.departmentId,
      });

      if (!department) {
        throw new NotFoundException(
          `Departamento con ID ${updateFixedAssetDto.departmentId} no encontrado`,
        );
      }

      if (!department.status) {
        throw new BadRequestException(
          `El Departamento con ID ${updateFixedAssetDto.departmentId} está inactivo`,
        );
      }

      fixedAsset.department = department;
    }

    if (updateFixedAssetDto.assetTypeId) {
      const assetType = await this.assetTypeRepository.findOneBy({
        id: updateFixedAssetDto.assetTypeId,
      });

      if (!assetType) {
        throw new NotFoundException(
          `Tipo de activo con ID ${updateFixedAssetDto.assetTypeId} no encontrado`,
        );
      }

      if (!assetType.status) {
        throw new BadRequestException(
          `El Tipo de activo con ID ${updateFixedAssetDto.assetTypeId} está inactivo`,
        );
      }

      fixedAsset.assetType = assetType;
    }

    Object.assign(fixedAsset, updateFixedAssetDto);

    return await this.fixedAssetRepository.save(fixedAsset);
  }

  async remove(id: number) {
    const fixedAsset = await this.findOne(id);
    fixedAsset.status = false;
    await this.fixedAssetRepository.save(fixedAsset);

    return {
      message: `Activo fijo con ID ${id} ha sido desactivado exitosamente`,
    };
  }
}
