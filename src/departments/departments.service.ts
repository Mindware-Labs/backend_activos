import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { Employee } from '../employees/entities/employee.entity';
import { FixedAsset } from '../fixed-assets/entities/fixed-asset.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(FixedAsset)
    private readonly fixedAssetRepository: Repository<FixedAsset>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existingDepartment = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existingDepartment) {
      throw new ConflictException(
        `Ya existe un departamento con el nombre "${createDepartmentDto.name}"`,
      );
    }

    return this.departmentRepository.save(createDepartmentDto);
  }

  async findAll({ take = 10, skip = 0 }: PaginationQueryDto) {
    const [departments, total] = await this.departmentRepository.findAndCount({
      take,
      skip,
      order: { id: 'ASC' },
    });

    return {
      data: departments,
      total,
    };
  }

  async findActive() {
    return this.departmentRepository.find({
      where: { status: true },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: boolean, paginationQuery: PaginationQueryDto) {
    const { take = 10, skip = 0 } = paginationQuery;
    const [departments, total] = await this.departmentRepository.findAndCount({
      where: { status },
      take,
      skip,
      order: { id: 'ASC' },
    });

    return {
      data: departments,
      total,
    };
  }

  async search(query: string) {
    return this.departmentRepository
      .createQueryBuilder('department')
      .where('LOWER(department.name) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(department.description) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('department.name', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const department = await this.departmentRepository.findOneBy({ id });
    if (!department) {
      throw new NotFoundException(
        `El departamento con el ID ${id} no fue encontrado`,
      );
    }
    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(id);

    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });

      if (existingDepartment && existingDepartment.id !== id) {
        throw new ConflictException(
          `Ya existe un departamento con el nombre "${updateDepartmentDto.name}"`,
        );
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: number) {
    const department = await this.findOne(id);

    const activeEmployees = await this.employeeRepository.count({
      where: { departmentId: id, status: true },
    });

    if (activeEmployees > 0) {
      throw new BadRequestException(
        `No se puede desactivar el departamento porque tiene ${activeEmployees} empleado(s) activo(s) asociado(s)`,
      );
    }

    const activeAssets = await this.fixedAssetRepository.count({
      where: { departmentId: id, status: true },
    });

    if (activeAssets > 0) {
      throw new BadRequestException(
        `No se puede desactivar el departamento porque tiene ${activeAssets} activo(s) fijo(s) activo(s) asociado(s)`,
      );
    }

    department.status = false;
    await this.departmentRepository.save(department);
    return {
      message: `Departamento con ID ${id} ha sido desactivado exitosamente`,
    };
  }
}
