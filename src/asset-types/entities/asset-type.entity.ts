import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FixedAsset } from '../../fixed-assets/entities/fixed-asset.entity';

@Entity('asset_types')
export class AssetType {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 30 })
  purchaseAccount: string;

  @Column({ type: 'varchar', length: 30 })
  depreciationAccount: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => FixedAsset, (fixedAsset) => fixedAsset.assetType)
  fixedAssets: FixedAsset[];
}
