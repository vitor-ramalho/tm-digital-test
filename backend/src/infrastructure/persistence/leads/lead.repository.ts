import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { LeadEntity } from './lead.entity';
import { LeadMapper } from './lead.mapper';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '../../../domain/leads/lead-status.enum';

/**
 * Repository for Lead entity
 * Handles database operations and converts between domain and infrastructure entities
 */
@Injectable()
export class LeadRepository {
  constructor(
    @InjectRepository(LeadEntity)
    private readonly repository: Repository<LeadEntity>,
  ) {}

  /**
   * Find all leads with optional filtering
   */
  async findAll(filters?: {
    status?: LeadStatus;
    municipality?: string;
    search?: string;
  }): Promise<Lead[]> {
    const where: FindOptionsWhere<LeadEntity> = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.municipality) {
      where.municipality = filters.municipality;
    }

    let query = this.repository.createQueryBuilder('lead');

    if (filters?.status) {
      query = query.andWhere('lead.status = :status', { status: filters.status });
    }

    if (filters?.municipality) {
      query = query.andWhere('lead.municipality = :municipality', {
        municipality: filters.municipality,
      });
    }

    if (filters?.search) {
      query = query.andWhere('(lead.name ILIKE :search OR lead.cpf LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    const entities = await query.orderBy('lead.created_at', 'DESC').getMany();

    return LeadMapper.toDomainList(entities);
  }

  /**
   * Find lead by ID
   */
  async findById(id: string): Promise<Lead | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return LeadMapper.toDomain(entity);
  }

  /**
   * Find lead by CPF
   */
  async findByCpf(cpf: string): Promise<Lead | null> {
    const cleanCpf = cpf.replace(/\D/g, '');
    const entity = await this.repository.findOne({ where: { cpf: cleanCpf } });
    if (!entity) return null;
    return LeadMapper.toDomain(entity);
  }

  /**
   * Find leads by status
   */
  async findByStatus(status: LeadStatus): Promise<Lead[]> {
    const entities = await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
    return LeadMapper.toDomainList(entities);
  }

  /**
   * Find leads by municipality
   */
  async findByMunicipality(municipality: string): Promise<Lead[]> {
    const entities = await this.repository.find({
      where: { municipality },
      order: { createdAt: 'DESC' },
    });
    return LeadMapper.toDomainList(entities);
  }

  /**
   * Create a new lead
   */
  async create(lead: Lead): Promise<Lead> {
    const entity = LeadMapper.toInfrastructure(lead);
    if (!entity) {
      throw new Error('Failed to map lead to infrastructure entity');
    }
    const saved = await this.repository.save(entity);
    const domainLead = LeadMapper.toDomain(saved);
    if (!domainLead) {
      throw new Error('Failed to create lead');
    }
    return domainLead;
  }

  /**
   * Update an existing lead
   */
  async update(id: string, lead: Partial<Lead>): Promise<Lead | null> {
    const existing = await this.repository.findOne({ where: { id } });

    if (!existing) {
      return null;
    }

    // Update only provided fields
    if (lead.name !== undefined) existing.name = lead.name;
    if (lead.cpf !== undefined) existing.cpf = lead.cpf;
    if (lead.status !== undefined) existing.status = lead.status;
    if (lead.comments !== undefined) existing.comments = lead.comments ?? null;
    if (lead.municipality !== undefined) existing.municipality = lead.municipality;

    const updated = await this.repository.save(existing);
    return LeadMapper.toDomain(updated);
  }

  /**
   * Delete a lead by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if CPF already exists
   */
  async existsByCpf(cpf: string, excludeId?: string): Promise<boolean> {
    const cleanCpf = cpf.replace(/\D/g, '');

    const query = this.repository
      .createQueryBuilder('lead')
      .where('lead.cpf = :cpf', { cpf: cleanCpf });

    if (excludeId) {
      query.andWhere('lead.id != :id', { id: excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Count leads by status
   */
  async countByStatus(status: LeadStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  /**
   * Count leads by municipality
   */
  async countByMunicipality(municipality: string): Promise<number> {
    return this.repository.count({ where: { municipality } });
  }

  /**
   * Find high priority leads (leads with properties > 100 hectares)
   */
  async findHighPriorityLeads(): Promise<Lead[]> {
    const entities = await this.repository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.properties', 'property')
      .where('property.area_hectares > 100')
      .distinct(true)
      .orderBy('lead.created_at', 'DESC')
      .getMany();

    return LeadMapper.toDomainList(entities);
  }

  /**
   * Get lead with properties count
   */
  async findByIdWithPropertiesCount(
    id: string,
  ): Promise<{ lead: Lead; propertiesCount: number } | null> {
    const entity = await this.repository
      .createQueryBuilder('lead')
      .leftJoin('lead.properties', 'property')
      .where('lead.id = :id', { id })
      .loadRelationCountAndMap('lead.propertiesCount', 'lead.properties')
      .getOne();

    if (!entity) {
      return null;
    }

    const lead = LeadMapper.toDomain(entity);
    if (!lead) {
      return null;
    }
    const propertiesCount = (entity as any).propertiesCount || 0;

    return { lead, propertiesCount };
  }

  /**
   * Get statistics grouped by status
   */
  async getStatusStatistics(): Promise<{ status: LeadStatus; count: number }[]> {
    const results = await this.repository
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany();

    return results.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
    }));
  }

  /**
   * Get statistics grouped by municipality
   */
  async getMunicipalityStatistics(): Promise<{ municipality: string; count: number }[]> {
    const results = await this.repository
      .createQueryBuilder('lead')
      .select('lead.municipality', 'municipality')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.municipality')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((r) => ({
      municipality: r.municipality,
      count: parseInt(r.count, 10),
    }));
  }
}
