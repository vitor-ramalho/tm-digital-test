import { RuralPropertyMapper } from './rural-property.mapper';
import { RuralPropertyEntity } from './rural-property.entity';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '../../../domain/rural-properties/crop-type.enum';

describe('RuralPropertyMapper', () => {
  const createDomainProperty = (): RuralProperty => {
    return new RuralProperty({
      id: '123e4567-e89b-12d3-a456-426614174000',
      leadId: 'lead-456',
      cropType: CropType.SOY,
      areaHectares: 150.5,
      geometry: '{"type":"Point","coordinates":[-47.9,-18.9]}',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    });
  };

  const createInfrastructureProperty = (): RuralPropertyEntity => {
    const entity = new RuralPropertyEntity();
    entity.id = '123e4567-e89b-12d3-a456-426614174000';
    entity.leadId = 'lead-456';
    entity.cropType = CropType.SOY;
    entity.areaHectares = 150.5;
    entity.geometry = '{"type":"Point","coordinates":[-47.9,-18.9]}';
    entity.createdAt = new Date('2024-01-01T00:00:00Z');
    entity.updatedAt = new Date('2024-01-02T00:00:00Z');
    return entity;
  };

  describe('toDomain', () => {
    it('should convert infrastructure entity to domain entity', () => {
      const infrastructureEntity = createInfrastructureProperty();
      
      const domainProperty = RuralPropertyMapper.toDomain(infrastructureEntity);
      
      expect(domainProperty).toBeInstanceOf(RuralProperty);
      expect(domainProperty.id).toBe(infrastructureEntity.id);
      expect(domainProperty.leadId).toBe(infrastructureEntity.leadId);
      expect(domainProperty.cropType).toBe(infrastructureEntity.cropType);
      expect(domainProperty.areaHectares).toBe(Number(infrastructureEntity.areaHectares));
      expect(domainProperty.geometry).toBe(infrastructureEntity.geometry);
      expect(domainProperty.createdAt).toEqual(infrastructureEntity.createdAt);
      expect(domainProperty.updatedAt).toEqual(infrastructureEntity.updatedAt);
    });

    it('should convert decimal area to number', () => {
      const entity = createInfrastructureProperty();
      entity.areaHectares = 99.99;
      
      const domainProperty = RuralPropertyMapper.toDomain(entity);
      
      expect(typeof domainProperty.areaHectares).toBe('number');
      expect(domainProperty.areaHectares).toBe(99.99);
    });

    it('should handle null geometry from database', () => {
      const infrastructureEntity = createInfrastructureProperty();
      infrastructureEntity.geometry = null;
      
      const domainProperty = RuralPropertyMapper.toDomain(infrastructureEntity);
      
      expect(domainProperty.geometry).toBeUndefined();
    });

    it('should return null for null entity', () => {
      const result = RuralPropertyMapper.toDomain(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined entity', () => {
      const result = RuralPropertyMapper.toDomain(undefined);
      expect(result).toBeNull();
    });

    it('should preserve all crop types', () => {
      const cropTypes = [CropType.SOY, CropType.CORN, CropType.COTTON];

      cropTypes.forEach((cropType) => {
        const entity = createInfrastructureProperty();
        entity.cropType = cropType;
        
        const domainProperty = RuralPropertyMapper.toDomain(entity);
        
        expect(domainProperty.cropType).toBe(cropType);
      });
    });
  });

  describe('toInfrastructure', () => {
    it('should convert domain entity to infrastructure entity', () => {
      const domainProperty = createDomainProperty();
      
      const infrastructureEntity = RuralPropertyMapper.toInfrastructure(domainProperty);
      
      expect(infrastructureEntity).toBeInstanceOf(RuralPropertyEntity);
      expect(infrastructureEntity.id).toBe(domainProperty.id);
      expect(infrastructureEntity.leadId).toBe(domainProperty.leadId);
      expect(infrastructureEntity.cropType).toBe(domainProperty.cropType);
      expect(infrastructureEntity.areaHectares).toBe(domainProperty.areaHectares);
      expect(infrastructureEntity.geometry).toBe(domainProperty.geometry);
      expect(infrastructureEntity.createdAt).toEqual(domainProperty.createdAt);
      expect(infrastructureEntity.updatedAt).toEqual(domainProperty.updatedAt);
    });

    it('should handle undefined geometry for database', () => {
      const domainProperty = createDomainProperty();
      domainProperty.geometry = undefined;
      
      const infrastructureEntity = RuralPropertyMapper.toInfrastructure(domainProperty);
      
      expect(infrastructureEntity.geometry).toBeNull();
    });

    it('should return null for null domain', () => {
      const result = RuralPropertyMapper.toInfrastructure(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined domain', () => {
      const result = RuralPropertyMapper.toInfrastructure(undefined);
      expect(result).toBeNull();
    });

    it('should preserve numeric precision for area', () => {
      const domainProperty = createDomainProperty();
      domainProperty.areaHectares = 123.45;
      
      const infrastructureEntity = RuralPropertyMapper.toInfrastructure(domainProperty);
      
      expect(infrastructureEntity.areaHectares).toBe(123.45);
    });
  });

  describe('toDomainList', () => {
    it('should convert array of entities to array of domain objects', () => {
      const entities = [
        createInfrastructureProperty(),
        createInfrastructureProperty(),
        createInfrastructureProperty(),
      ];
      
      const domainProperties = RuralPropertyMapper.toDomainList(entities);
      
      expect(domainProperties).toHaveLength(3);
      domainProperties.forEach((property) => {
        expect(property).toBeInstanceOf(RuralProperty);
      });
    });

    it('should return empty array for empty input', () => {
      const result = RuralPropertyMapper.toDomainList([]);
      expect(result).toEqual([]);
    });

    it('should filter out null values', () => {
      const entities = [
        createInfrastructureProperty(),
        null,
        createInfrastructureProperty(),
        undefined,
      ];
      
      const domainProperties = RuralPropertyMapper.toDomainList(entities);
      
      expect(domainProperties).toHaveLength(2);
      domainProperties.forEach((property) => {
        expect(property).toBeInstanceOf(RuralProperty);
        expect(property).not.toBeNull();
      });
    });
  });

  describe('bidirectional mapping', () => {
    it('should maintain data integrity in round-trip conversion', () => {
      const originalDomain = createDomainProperty();
      
      const infrastructure = RuralPropertyMapper.toInfrastructure(originalDomain);
      const backToDomain = RuralPropertyMapper.toDomain(infrastructure);
      
      expect(backToDomain.id).toBe(originalDomain.id);
      expect(backToDomain.leadId).toBe(originalDomain.leadId);
      expect(backToDomain.cropType).toBe(originalDomain.cropType);
      expect(backToDomain.areaHectares).toBe(originalDomain.areaHectares);
    });

    it('should handle geometry in round-trip conversion', () => {
      const domainWithGeometry = createDomainProperty();
      domainWithGeometry.geometry = '{"type":"Polygon","coordinates":[]}';
      
      const infrastructure = RuralPropertyMapper.toInfrastructure(domainWithGeometry);
      const backToDomain = RuralPropertyMapper.toDomain(infrastructure);
      
      expect(backToDomain.geometry).toBe('{"type":"Polygon","coordinates":[]}');
    });

    it('should handle undefined geometry in round-trip conversion', () => {
      const domainWithoutGeometry = createDomainProperty();
      domainWithoutGeometry.geometry = undefined;
      
      const infrastructure = RuralPropertyMapper.toInfrastructure(domainWithoutGeometry);
      const backToDomain = RuralPropertyMapper.toDomain(infrastructure);
      
      expect(backToDomain.geometry).toBeUndefined();
    });

    it('should preserve high priority status through mapping', () => {
      const highPriorityProperty = createDomainProperty();
      highPriorityProperty.areaHectares = 150;
      
      const infrastructure = RuralPropertyMapper.toInfrastructure(highPriorityProperty);
      const backToDomain = RuralPropertyMapper.toDomain(infrastructure);
      
      expect(backToDomain.isHighPriority()).toBe(true);
    });
  });
});
