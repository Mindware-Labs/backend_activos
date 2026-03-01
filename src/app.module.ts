import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/TypeOrmConfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentsModule } from './departments/departments.module';
import { AssetTypesModule } from './asset-types/asset-types.module';
import { EmployeesModule } from './employees/employees.module';
import { FixedAssetsModule } from './fixed-assets/fixed-assets.module';
import { DepreciationCalculationsModule } from './depreciation-calculations/depreciation-calculations.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig()), DepartmentsModule, AssetTypesModule, EmployeesModule, FixedAssetsModule, DepreciationCalculationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
