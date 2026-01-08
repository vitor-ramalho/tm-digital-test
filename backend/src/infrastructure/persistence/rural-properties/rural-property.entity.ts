import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CropType } from '../../../domain/rural-properties/crop-type.enum';
import { LeadEntity } from '../leads/lead.entity';

/**
 * Infrastructure Entity - RuralProperty (TypeORM)
 * Database persistence model for RuralProperty
 * Maps to the 'rural_properties' table in PostgreSQL
 */
@Entity('rural_properties')
@Index(['leadId', 'cropType']) // Composite index for filtering by lead and crop type
@Index(['areaHectares']) // Index for sorting and filtering by area
export class RuralPropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lead_id', type: 'uuid' })
  @Index() // Index for foreign key lookups
  leadId: string;

  @Column({
    name: 'crop_type',
    type: 'enum',
    enum: CropType,
  })
  cropType: CropType;

  @Column({ name: 'area_hectares', type: 'decimal', precision: 10, scale: 2 })
  areaHectares: number;

  @Column({ type: 'text', nullable: true })
  geometry: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationship: Many Rural Properties belong to One Lead
  @ManyToOne(() => LeadEntity, (lead) => lead.properties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lead_id' })
  lead: LeadEntity;
}
