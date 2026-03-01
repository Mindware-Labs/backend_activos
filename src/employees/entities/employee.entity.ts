import { Department } from '../../departments/entities/department.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum PersonType {
  FISICA = 'Fisica',
  JURIDICA = 'Juridica',
}

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 11, unique: true })
  cedula: string;

  @Column({ type: 'enum', enum: PersonType })
  personType: PersonType;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column()
  departmentId: number;

  @ManyToOne(() => Department, (department) => department.employees)
  department: Department;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}
