import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AccountingEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  auxiliaryId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 8 })
  inventoryTypeId: number;

  @Column({ type: 'int', default: 0 })
  accountId: number;

  @Column({ type: 'varchar', length: 255 })
  accountName: string;

  @Column({ type: 'varchar', length: 2 })
  movementType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  date: Date;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
