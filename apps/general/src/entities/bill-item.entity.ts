import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bill_items')
export class BillItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  cuit: string;

  @Column({ length: 25 })
  afipPassword: string;

  @Column({ length: 255 })
  name: string;

  @Column({ default: true })
  realPerson: boolean;

  @Column({ nullable: true, length: 150 })
  address: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: false })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 