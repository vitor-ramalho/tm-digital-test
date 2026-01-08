import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { RuralPropertyEntity } from './rural-property.entity';

/**
 * Mapper between Domain Entity and Infrastructure Entity
 * Converts between framework-agnostic domain models and TypeORM entities
 */
export class RuralPropertyMapper {
  /**
   * Convert TypeORM entity to Domain entity
   */
  static toDomain(entity: RuralPropertyEntity): RuralProperty | null {
    if (!entity) return null;

    return new RuralProperty({
      id: entity.id,
      leadId: entity.leadId,
      cropType: entity.cropType,
      areaHectares: Number(entity.areaHectares),
      geometry: entity.geometry ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Convert Domain entity to TypeORM entity
   */
  static toInfrastructure(domain: RuralProperty): RuralPropertyEntity | null {
    if (!domain) return null;

    const entity = new RuralPropertyEntity();
    entity.id = domain.id;
    entity.leadId = domain.leadId;
    entity.cropType = domain.cropType;
    entity.areaHectares = domain.areaHectares;
    entity.geometry = domain.geometry ?? null;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }

  /**
   * Convert array of TypeORM entities to Domain entities
   */
  static toDomainList(entities: RuralPropertyEntity[]): RuralProperty[] {
    return entities
      .map((entity) => this.toDomain(entity))
      .filter((property): property is RuralProperty => property !== null);
  }
}
