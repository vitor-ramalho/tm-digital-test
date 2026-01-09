import { Lead } from '@domain/leads/lead.entity';
import { LeadEntity } from './lead.entity';

/**
 * Mapper between Domain Entity and Infrastructure Entity
 * Converts between framework-agnostic domain models and TypeORM entities
 */
export class LeadMapper {
  /**
   * Convert TypeORM entity to Domain entity
   */
  static toDomain(entity: LeadEntity | null | undefined): Lead | null {
    if (!entity) return null;

    return new Lead({
      id: entity.id,
      name: entity.name,
      cpf: entity.cpf,
      status: entity.status,
      comments: entity.comments ?? undefined,
      municipality: entity.municipality,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Convert Domain entity to TypeORM entity
   */
  static toInfrastructure(domain: Lead | null | undefined): LeadEntity | null {
    if (!domain) return null;

    const entity = new LeadEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.cpf = domain.cpf;
    entity.status = domain.status;
    entity.comments = domain.comments ?? null;
    entity.municipality = domain.municipality;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }

  /**
   * Convert array of TypeORM entities to Domain entities
   */
  static toDomainList(entities: LeadEntity[]): Lead[] {
    return entities
      .map((entity) => this.toDomain(entity))
      .filter((lead): lead is Lead => lead !== null);
  }
}
