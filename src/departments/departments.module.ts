import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { FixedAsset } from '../fixed-assets/entities/fixed-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Employee, FixedAsset])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
