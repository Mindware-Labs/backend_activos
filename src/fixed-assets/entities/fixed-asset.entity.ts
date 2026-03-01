import { DepreciationCalculation } from '../../depreciation-calculations/entities/depreciation-calculation.entity';
import { AssetType } from '../../asset-types/entities/asset-type.entity';
import { Department } from '../../departments/entities/department.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FixedAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  registrationDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchaseValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  residualValue: number;

  @Column({ type: 'int', nullable: true })
  usefulLifeMonths: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  accumulatedDepreciation: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'int' })
  departmentId: number;

  @ManyToOne(() => Department, (department) => department.fixedAssets)
  department: Department;

  @Column({ type: 'int' })
  assetTypeId: number;

  @ManyToOne(() => AssetType, (assetType) => assetType.fixedAssets)
  assetType: AssetType;

  @OneToMany(
    () => DepreciationCalculation,
    (depreciationCalculation) => depreciationCalculation.fixedAsset,
  )
  depreciationCalculations: DepreciationCalculation[];
}
