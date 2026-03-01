import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetType } from './entities/asset-type.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { FixedAsset } from '../fixed-assets/entities/fixed-asset.entity';

@Injectable()
export class AssetTypesService {
  constructor(
    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,

    @InjectRepository(FixedAsset)
    private readonly fixedAssetRepository: Repository<FixedAsset>,
  ) {}

  async create(createAssetTypeDto: CreateAssetTypeDto) {
    const existingAssetType = await this.assetTypeRepository.findOne({
      where: { name: createAssetTypeDto.name },
    });

    if (existingAssetType) {
      throw new ConflictException(
        `Ya existe un tipo de activo con el nombre "${createAssetTypeDto.name}"`,
      );
    }

    return this.assetTypeRepository.save(createAssetTypeDto);
  }

  async findAll({ take = 10, skip = 0 }: PaginationQueryDto) {
    const [assetTypes, total] = await this.assetTypeRepository.findAndCount({
      take,
      skip,
      order: { id: 'ASC' },
    });

    return {
      data: assetTypes,
      total,
    };
  }

  async findActive() {
    return this.assetTypeRepository.find({
      where: { status: true },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: boolean, paginationQuery: PaginationQueryDto) {
    const { take = 10, skip = 0 } = paginationQuery;
    const [assetTypes, total] = await this.assetTypeRepository.findAndCount({
      where: { status },
      take,
      skip,
      order: { id: 'ASC' },
    });

    return {
      data: assetTypes,
      total,
    };
  }

  async search(query: string) {
    return this.assetTypeRepository
      .createQueryBuilder('assetType')
      .where('LOWER(assetType.name) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(assetType.description) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('assetType.name', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const assetType = await this.assetTypeRepository.findOneBy({ id });
    if (!assetType) {
      throw new NotFoundException(
        `El Tipo de Activo con el ID ${id} no fue encontrado.`,
      );
    }
    return assetType;
  }

  async update(id: number, updateAssetTypeDto: UpdateAssetTypeDto) {
    const assetType = await this.findOne(id);

    if (updateAssetTypeDto.name && updateAssetTypeDto.name !== assetType.name) {
      const existingAssetType = await this.assetTypeRepository.findOne({
        where: { name: updateAssetTypeDto.name },
      });

      if (existingAssetType && existingAssetType.id !== id) {
        throw new ConflictException(
          `Ya existe un tipo de activo con el nombre "${updateAssetTypeDto.name}"`,
        );
      }
    }

    Object.assign(assetType, updateAssetTypeDto);
    return await this.assetTypeRepository.save(assetType);
  }

  async remove(id: number) {
    const assetType = await this.findOne(id);

    const activeAssets = await this.fixedAssetRepository.count({
      where: { assetTypeId: id, status: true },
    });

    if (activeAssets > 0) {
      throw new BadRequestException(
        `No se puede desactivar el tipo de activo porque tiene ${activeAssets} activo(s) fijo(s) activo(s) asociado(s)`,
      );
    }

    assetType.status = false;
    await this.assetTypeRepository.save(assetType);
    return {
      message: `Tipo de Activo con ID ${id} ha sido desactivado exitosamente`,
    };
  }
}
