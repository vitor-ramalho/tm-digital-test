import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RuralPropertyRepository } from './rural-property.repository';
import { RuralPropertyEntity } from './rural-property.entity';
import { RuralPropertyMapper } from './rural-property.mapper';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';

describe('RuralPropertyRepository', () => {
  let repository: RuralPropertyRepository;
  let typeormRepository: Repository<RuralPropertyEntity>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  const mockTypeormRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuralPropertyRepository,
        {
          provide: getRepositoryToken(RuralPropertyEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<RuralPropertyRepository>(RuralPropertyRepository);
    typeormRepository = module.get<Repository<RuralPropertyEntity>>(
      getRepositoryToken(RuralPropertyEntity),
    );

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all properties without filters', async () => {
      const entities = [createPropertyEntity(), createPropertyEntity()];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(mockTypeormRepository.createQueryBuilder).toHaveBeenCalledWith('property');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('property.created_at', 'DESC');
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(RuralProperty);
    });

    it('should filter by leadId', async () => {
      const entities = [createPropertyEntity({ leadId: 'lead-123' })];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll({ leadId: 'lead-123' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('property.lead_id = :leadId', {
        leadId: 'lead-123',
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by cropType', async () => {
      const entities = [createPropertyEntity({ cropType: CropType.SOY })];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll({ cropType: CropType.SOY });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('property.crop_type = :cropType', {
        cropType: CropType.SOY,
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by minimum area', async () => {
      const entities = [createPropertyEntity({ areaHectares: 150 })];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll({ minArea: 100 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('property.area_hectares >= :minArea', {
        minArea: 100,
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by maximum area', async () => {
      const entities = [createPropertyEntity({ areaHectares: 50 })];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll({ maxArea: 100 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('property.area_hectares <= :maxArea', {
        maxArea: 100,
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by high priority only', async () => {
      const entities = [createPropertyEntity({ areaHectares: 150 })];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll({ highPriorityOnly: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('property.area_hectares > 100');
      expect(result).toHaveLength(1);
    });

    it('should combine multiple filters', async () => {
      const entities = [createPropertyEntity()];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      await repository.findAll({
        leadId: 'lead-123',
        cropType: CropType.CORN,
        minArea: 50,
        maxArea: 200,
      });

      // When both minArea and maxArea are provided, it uses BETWEEN (single andWhere call)
      // Plus leadId and cropType = 3 total andWhere calls
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findById', () => {
    it('should return property when found', async () => {
      const entity = createPropertyEntity();
      mockTypeormRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findById('uuid-123');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result).toBeInstanceOf(RuralProperty);
    });

    it('should return null when not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByLeadId', () => {
    it('should return all properties for a lead', async () => {
      const entities = [
        createPropertyEntity({ leadId: 'lead-123' }),
        createPropertyEntity({ leadId: 'lead-123' }),
      ];
      mockTypeormRepository.find.mockResolvedValue(entities);

      const result = await repository.findByLeadId('lead-123');

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { leadId: 'lead-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findByCropType', () => {
    it('should return properties with specific crop type', async () => {
      const entities = [createPropertyEntity({ cropType: CropType.COTTON })];
      mockTypeormRepository.find.mockResolvedValue(entities);

      const result = await repository.findByCropType(CropType.COTTON);

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { cropType: CropType.COTTON },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findHighPriorityProperties', () => {
    it('should return properties with area > 100 hectares', async () => {
      const entities = [createPropertyEntity({ areaHectares: 150 })];
      mockTypeormRepository.find.mockResolvedValue(entities);

      const result = await repository.findHighPriorityProperties();

      expect(result).toHaveLength(1);
      expect(result[0].areaHectares).toBeGreaterThan(100);
    });
  });

  describe('create', () => {
    it('should create and return new property', async () => {
      const domainProperty = createDomainProperty();
      const entity = createPropertyEntity();
      mockTypeormRepository.save.mockResolvedValue(entity);

      const result = await repository.create(domainProperty);

      expect(mockTypeormRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(RuralProperty);
    });

    it('should throw error if mapper fails', async () => {
      const domainProperty = createDomainProperty();
      jest.spyOn(RuralPropertyMapper, 'toInfrastructure').mockReturnValue(null);

      await expect(repository.create(domainProperty)).rejects.toThrow(
        'Failed to map property to infrastructure entity',
      );
    });
  });

  describe('update', () => {
    it('should update existing property', async () => {
      const existing = createPropertyEntity();
      const updated = { ...existing, areaHectares: 200 };
      mockTypeormRepository.findOne.mockResolvedValue(existing);
      mockTypeormRepository.save.mockResolvedValue(updated);

      const result = await repository.update('uuid-123', {
        areaHectares: 200,
      });

      expect(result).not.toBeNull();
      expect(result?.areaHectares).toBe(200);
    });

    it('should return null when property not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.update('nonexistent', { areaHectares: 100 });

      expect(result).toBeNull();
    });

    it('should update only provided fields', async () => {
      const existing = createPropertyEntity();
      mockTypeormRepository.findOne.mockResolvedValue(existing);
      mockTypeormRepository.save.mockResolvedValue(existing);

      await repository.update('uuid-123', {
        cropType: CropType.COTTON,
      });

      expect(existing.cropType).toBe(CropType.COTTON);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(existing);
    });

    it('should not update fields that are not provided', async () => {
      const existing = createPropertyEntity({ geometry: '{"type":"Point"}' });
      mockTypeormRepository.findOne.mockResolvedValue(existing);
      mockTypeormRepository.save.mockResolvedValue(existing);

      await repository.update('uuid-123', { areaHectares: 150 });

      expect(mockTypeormRepository.save).toHaveBeenCalled();
      const savedEntity = mockTypeormRepository.save.mock.calls[0][0];
      expect(savedEntity.areaHectares).toBe(150);
      expect(savedEntity.geometry).toBe('{"type":"Point"}'); // Should remain unchanged
    });
  });

  describe('delete', () => {
    it('should return true when delete succeeds', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await repository.delete('uuid-123');

      expect(result).toBe(true);
    });

    it('should return false when nothing deleted', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      const result = await repository.delete('nonexistent');

      expect(result).toBe(false);
    });

    it('should handle null affected count', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: null, raw: {} });

      const result = await repository.delete('uuid-123');

      expect(result).toBe(false);
    });
  });

  describe('countByLeadId', () => {
    it('should return count of properties for lead', async () => {
      mockTypeormRepository.count.mockResolvedValue(5);

      const result = await repository.countByLeadId('lead-123');

      expect(mockTypeormRepository.count).toHaveBeenCalledWith({
        where: { leadId: 'lead-123' },
      });
      expect(result).toBe(5);
    });
  });

  describe('leadHasHighPriorityProperties', () => {
    it('should return true when lead has high priority properties', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(2);

      const result = await repository.leadHasHighPriorityProperties('lead-123');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('property.lead_id = :leadId', {
        leadId: 'lead-123',
      });
      expect(result).toBe(true);
    });

    it('should return false when lead has no high priority properties', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);

      const result = await repository.leadHasHighPriorityProperties('lead-123');

      expect(result).toBe(false);
    });
  });

  describe('getTotalAreaByLeadId', () => {
    it('should return sum of all areas for lead', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ total: '350.50' });

      const result = await repository.getTotalAreaByLeadId('lead-123');

      expect(mockQueryBuilder.select).toHaveBeenCalledWith('SUM(property.area_hectares)', 'total');
      expect(result).toBe(350.5);
    });

    it('should return 0 when no properties found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ total: null });

      const result = await repository.getTotalAreaByLeadId('lead-123');

      expect(result).toBe(0);
    });
  });

  describe('getAverageAreaByCropType', () => {
    it('should return average area for crop type', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ average: '125.75' });

      const result = await repository.getAverageAreaByCropType(CropType.SOY);

      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'AVG(property.area_hectares)',
        'average',
      );
      expect(result).toBe(125.75);
    });

    it('should return 0 when no properties found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ average: null });

      const result = await repository.getAverageAreaByCropType(CropType.CORN);

      expect(result).toBe(0);
    });
  });

  describe('getCropTypeStatistics', () => {
    it('should return statistics grouped by crop type', async () => {
      const stats = [
        { cropType: CropType.SOY, count: '10', totalArea: '1500.50' },
        { cropType: CropType.CORN, count: '5', totalArea: '750.25' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(stats);

      const result = await repository.getCropTypeStatistics();

      expect(mockQueryBuilder.select).toHaveBeenCalledWith('property.crop_type', 'cropType');
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('property.crop_type');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        cropType: CropType.SOY,
        count: 10,
        totalArea: 1500.5,
      });
    });
  });

  describe('countHighPriorityByCropType', () => {
    it('should count high priority properties by crop type', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(8);

      const result = await repository.countHighPriorityByCropType(CropType.SOY);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('property.crop_type = :cropType', {
        cropType: CropType.SOY,
      });
      expect(result).toBe(8);
    });
  });

  describe('countByCropType', () => {
    it('should count properties by crop type', async () => {
      mockTypeormRepository.count.mockResolvedValue(12);

      const result = await repository.countByCropType(CropType.COTTON);

      expect(mockTypeormRepository.count).toHaveBeenCalledWith({
        where: { cropType: CropType.COTTON },
      });
      expect(result).toBe(12);
    });
  });

  // Helper functions
  function createPropertyEntity(overrides?: Partial<RuralPropertyEntity>): RuralPropertyEntity {
    const entity = new RuralPropertyEntity();
    entity.id = overrides?.id || 'uuid-123';
    entity.leadId = overrides?.leadId || 'lead-123';
    entity.cropType = overrides?.cropType || CropType.SOY;
    entity.areaHectares = overrides?.areaHectares !== undefined ? overrides.areaHectares : 100;
    entity.geometry = overrides?.geometry !== undefined ? overrides.geometry : null;
    entity.createdAt = overrides?.createdAt || new Date();
    entity.updatedAt = overrides?.updatedAt || new Date();
    return entity;
  }

  function createDomainProperty(): RuralProperty {
    return new RuralProperty({
      id: 'uuid-123',
      leadId: 'lead-123',
      cropType: CropType.SOY,
      areaHectares: 100,
      geometry: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
});
