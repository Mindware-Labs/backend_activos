import { FixedAsset } from '../../fixed-assets/entities/fixed-asset.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DepreciationCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  processYear: number;

  @Column({ type: 'int' })
  processMonth: number;

  @Column({ type: 'date' })
  processDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amountDepreciation: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  accumulatedDepreciation: number;

  @Column({ type: 'varchar', length: 255 })
  purchaseAccount: string;

  @Column({ type: 'varchar', length: 255 })
  depreciationAccount: string;

  @Column({ type: 'int' })
  fixedAssetId: number;

  @ManyToOne(
    () => FixedAsset,
    (fixedAsset) => fixedAsset.depreciationCalculations,
  )
  fixedAsset: FixedAsset;
}
