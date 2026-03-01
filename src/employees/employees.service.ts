import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { Department } from 'src/departments/entities/department.entity';
import { date } from 'joi';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const department = await this.departmentRepository.findOneBy({
      id: createEmployeeDto.departmentId,
    });

    if (!department) {
      throw new NotFoundException(
        `El Departamento con el ID ${createEmployeeDto.departmentId} no fue encontrado.`,
      );
    }

    if (!department.status) {
      throw new BadRequestException(
        `El Departamento con el ID ${createEmployeeDto.departmentId} está inactivo.`,
      );
    }

    const existingEmployee = await this.employeeRepository.findOneBy({
      cedula: createEmployeeDto.cedula,
    });

    if (existingEmployee) {
      throw new BadRequestException(
        `El Empleado con la cédula ${createEmployeeDto.cedula} ya existe.`,
      );
    }

    return await this.employeeRepository.save({
      ...createEmployeeDto,
      department,
    });
  }

  async findAll({ take, skip }: PaginationQueryDto) {
    const [employees, total] = await this.employeeRepository.findAndCount({
      take,
      skip,
      relations: { department: true },
      order: { id: 'ASC' },
    });
    return {
      data: employees,
      total,
    };
  }

  async findActive() {
    return this.employeeRepository.find({
      where: { status: true },
      relations: { department: true },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: boolean, paginationQuery: PaginationQueryDto) {
    const { take = 10, skip = 0 } = paginationQuery;
    const [employees, total] = await this.employeeRepository.findAndCount({
      where: { status },
      relations: { department: true },
      take,
      skip,
      order: { id: 'ASC' },
    });

    return {
      data: employees,
      total,
    };
  }

  async findByDepartment(
    departmentId: number,
    paginationQuery: PaginationQueryDto,
  ) {
    const { take = 10, skip = 0 } = paginationQuery;
    const [employees, total] = await this.employeeRepository.findAndCount({
      where: { departmentId },
      relations: { department: true },
      take,
      skip,
      order: { id: 'ASC' },
    });

    return {
      data: employees,
      total,
    };
  }

  async search(query: string) {
    return this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department')
      .where('LOWER(employee.name) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('employee.cedula LIKE :query', { query: `%${query}%` })
      .orderBy('employee.name', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: { department: true },
    });
    if (!employee) {
      throw new NotFoundException(
        `El Empleado con el ID ${id} no fue encontrado`,
      );
    }
    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    if (updateEmployeeDto.cedula) {
      const existingEmployee = await this.employeeRepository.findOneBy({
        cedula: updateEmployeeDto.cedula,
      });

      if (existingEmployee && existingEmployee.id !== id) {
        throw new BadRequestException(
          `El Empleado con la cédula ${updateEmployeeDto.cedula} ya existe.`,
        );
      }
    }

    if (updateEmployeeDto.departmentId) {
      const department = await this.departmentRepository.findOneBy({
        id: updateEmployeeDto.departmentId,
      });

      if (!department) {
        throw new NotFoundException(
          `El Departamento con el ID ${updateEmployeeDto.departmentId} no fue encontrado.`,
        );
      }

      if (!department.status) {
        throw new BadRequestException(
          `El Departamento con el ID ${updateEmployeeDto.departmentId} está inactivo.`,
        );
      }

      employee.department = department;
    }

    Object.assign(employee, updateEmployeeDto);

    return await this.employeeRepository.save(employee);
  }

  async remove(id: number) {
    const employee = await this.findOne(id);
    employee.status = false;
    await this.employeeRepository.save(employee);

    return {
      message: `Empleado con ID ${id} ha sido desactivado exitosamente`,
    };
  }
}
