import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../../../libs/shared/common/src/index'; // Adjust the import path as necessary

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: 'local' })
  provider: string; // 'local', 'google'

  @Column({ default: true })
  isActive: boolean;

  @Column('enum', { enum: UserRole, array: true, default: [UserRole.USER] })
  roles: UserRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({nullable: true, default: null})
  lastSendVerificationEmail: Date;

  @Column({type: 'jsonb', nullable: true})
  billItems: string[];
} 