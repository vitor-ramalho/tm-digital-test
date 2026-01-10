import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThan } from 'typeorm';
import { RuralPropertyEntity } from './rural-property.entity';
import { RuralPropertyMapper } from './rural-property.mapper';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '../../../domain/rural-properties/crop-type.enum';

/**
 * Repository for RuralProperty entity
 * Handles database operations and converts between domain and infrastructure entities
 */
@Injectable()
export class RuralPropertyRepository {
  constructor(
    @InjectRepository(RuralPropertyEntity)
    private readonly repository: Repository<RuralPropertyEntity>,
  ) {}

  /**
   * Find all properties with optional filtering
   */
  async findAll(filters?: {
    leadId?: string;
    cropType?: CropType;
    minArea?: number;
    maxArea?: number;
    highPriorityOnly?: boolean;
  }): Promise<RuralProperty[]> {
    const where: FindOptionsWhere<RuralPropertyEntity> = {};

    if (filters?.leadId) {
      where.leadId = filters.leadId;
    }

    if (filters?.cropType) {
      where.cropType = filters.cropType;
    }

    let query = this.repository.createQueryBuilder('property');

    if (filters?.leadId) {
      query = query.andWhere('property.lead_id = :leadId', { leadId: filters.leadId });
    }

    if (filters?.cropType) {
      query = query.andWhere('property.crop_type = :cropType', { cropType: filters.cropType });
    }

    if (filters?.highPriorityOnly) {
      query = query.andWhere('property.area_hectares > 100');
    }

    if (filters?.minArea !== undefined && filters?.maxArea !== undefined) {
      query = query.andWhere('property.area_hectares BETWEEN :minArea AND :maxArea', {
        minArea: filters.minArea,
        maxArea: filters.maxArea,
      });
    } else if (filters?.minArea !== undefined) {
      query = query.andWhere('property.area_hectares >= :minArea', { minArea: filters.minArea });
    } else if (filters?.maxArea !== undefined) {
      query = query.andWhere('property.area_hectares <= :maxArea', { maxArea: filters.maxArea });
    }

    const entities = await query.orderBy('property.created_at', 'DESC').getMany();

    return RuralPropertyMapper.toDomainList(entities);
  }

  /**
   * Find property by ID
   */
  async findById(id: string): Promise<RuralProperty | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return RuralPropertyMapper.toDomain(entity);
  }

  /**
   * Find properties by lead ID
   */
  async findByLeadId(leadId: string): Promise<RuralProperty[]> {
    const entities = await this.repository.find({
      where: { leadId },
      order: { createdAt: 'DESC' },
    });
    return RuralPropertyMapper.toDomainList(entities);
  }

  /**
   * Find properties by crop type
   */
  async findByCropType(cropType: CropType): Promise<RuralProperty[]> {
    const entities = await this.repository.find({
      where: { cropType },
      order: { createdAt: 'DESC' },
    });
    return RuralPropertyMapper.toDomainList(entities);
  }

  /**
   * Find high priority properties (area > 100 hectares)
   */
  async findHighPriorityProperties(): Promise<RuralProperty[]> {
    const entities = await this.repository.find({
      where: { areaHectares: MoreThan(100) },
      order: { areaHectares: 'DESC' },
    });
    return RuralPropertyMapper.toDomainList(entities);
  }

  /**
   * Create a new property
   */
  async create(property: RuralProperty): Promise<RuralProperty> {
    const entity = RuralPropertyMapper.toInfrastructure(property);
    if (!entity) {
      throw new Error('Failed to map property to infrastructure entity');
    }
    const saved = await this.repository.save(entity);
    const domainProperty = RuralPropertyMapper.toDomain(saved);
    if (!domainProperty) {
      throw new Error('Failed to create rural property');
    }
    return domainProperty;
  }

  /**
   * Update an existing property
   */
  async update(id: string, property: Partial<RuralProperty>): Promise<RuralProperty | null> {
    const existing = await this.repository.findOne({ where: { id } });

    if (!existing) {
      return null;
    }

    // Update only provided fields
    if (property.leadId !== undefined) existing.leadId = property.leadId;
    if (property.cropType !== undefined) existing.cropType = property.cropType;
    if (property.areaHectares !== undefined) existing.areaHectares = property.areaHectares;
    if (property.geometry !== undefined) existing.geometry = property.geometry ?? null;

    const updated = await this.repository.save(existing);
    return RuralPropertyMapper.toDomain(updated);
  }

  /**
   * Delete a property by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Count properties by lead ID
   */
  async countByLeadId(leadId: string): Promise<number> {
    return this.repository.count({ where: { leadId } });
  }

  /**
   * Count properties by crop type
   */
  async countByCropType(cropType: CropType): Promise<number> {
    return this.repository.count({ where: { cropType } });
  }

  /**
   * Check if lead has high priority properties
   */
  async leadHasHighPriorityProperties(leadId: string): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('property')
      .where('property.lead_id = :leadId', { leadId })
      .andWhere('property.area_hectares > 100')
      .getCount();

    return count > 0;
  }

  /**
   * Get total area by lead ID
   */
  async getTotalAreaByLeadId(leadId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('property')
      .select('SUM(property.area_hectares)', 'total')
      .where('property.lead_id = :leadId', { leadId })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  /**
   * Get statistics grouped by crop type
   */
  async getCropTypeStatistics(): Promise<
    { cropType: CropType; count: number; totalArea: number }[]
  > {
    const results = await this.repository
      .createQueryBuilder('property')
      .select('property.crop_type', 'cropType')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(property.area_hectares)', 'totalArea')
      .groupBy('property.crop_type')
      .getRawMany();

    return results.map((r) => ({
      cropType: r.cropType,
      count: parseInt(r.count, 10),
      totalArea: parseFloat(r.totalArea || '0'),
    }));
  }

  /**
   * Find property by ID with lead information
   */
  async findByIdWithLead(id: string): Promise<RuralProperty | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['lead'],
    });

    if (!entity) {
      return null;
    }

    return RuralPropertyMapper.toDomain(entity);
  }

  /**
   * Find properties with lead information
   */
  async findAllWithLeads(filters?: {
    cropType?: CropType;
    highPriorityOnly?: boolean;
  }): Promise<RuralProperty[]> {
    let query = this.repository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.lead', 'lead');

    if (filters?.cropType) {
      query = query.andWhere('property.crop_type = :cropType', { cropType: filters.cropType });
    }

    if (filters?.highPriorityOnly) {
      query = query.andWhere('property.area_hectares > 100');
    }

    const entities = await query.orderBy('property.created_at', 'DESC').getMany();

    return RuralPropertyMapper.toDomainList(entities);
  }

  /**
   * Get average area by crop type
   */
  async getAverageAreaByCropType(cropType: CropType): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('property')
      .select('AVG(property.area_hectares)', 'average')
      .where('property.crop_type = :cropType', { cropType })
      .getRawOne();

    return parseFloat(result?.average || '0');
  }

  /**
   * Count high priority properties by crop type
   */
  async countHighPriorityByCropType(cropType: CropType): Promise<number> {
    return this.repository
      .createQueryBuilder('property')
      .where('property.crop_type = :cropType', { cropType })
      .andWhere('property.area_hectares > 100')
      .getCount();
  }
}
