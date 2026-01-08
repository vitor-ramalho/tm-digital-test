import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { LeadStatus } from '../../../domain/leads/lead-status.enum';
import { RuralPropertyEntity } from '../rural-properties/rural-property.entity';

/**
 * Infrastructure Entity - Lead (TypeORM)
 * Database persistence model for Lead
 * Maps to the 'leads' table in PostgreSQL
 */
@Entity('leads')
@Index(['status', 'municipality']) // Composite index for filtering
@Index(['cpf'], { unique: true }) // Unique constraint on CPF
export class LeadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index() // Index for searching by name
  name: string;

  @Column({ type: 'varchar', length: 11 })
  cpf: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @Column({ type: 'varchar', length: 255 })
  municipality: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationship: One Lead has Many Rural Properties
  @OneToMany(() => RuralPropertyEntity, (property) => property.lead, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  properties: RuralPropertyEntity[];
}
