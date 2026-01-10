import { Test, TestingModule } from '@nestjs/testing';
import { ListRuralPropertiesService } from './list-rural-properties.service';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';

describe('ListRuralPropertiesService', () => {
  let service: ListRuralPropertiesService;
  let ruralPropertyRepository: RuralPropertyRepository;

  const mockRuralPropertyRepository = {
    findAll: jest.fn(),
    findByLeadId: jest.fn(),
    findByCropType: jest.fn(),
    findHighPriorityProperties: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListRuralPropertiesService,
        {
          provide: RuralPropertyRepository,
          useValue: mockRuralPropertyRepository,
        },
      ],
    }).compile();

    service = module.get<ListRuralPropertiesService>(ListRuralPropertiesService);
    ruralPropertyRepository = module.get<RuralPropertyRepository>(RuralPropertyRepository);

    jest.clearAllMocks();
  });

  const createMockProperty = (overrides?: Partial<RuralProperty>): RuralProperty => {
    return new RuralProperty({
      id: 'property-uuid-123',
      leadId: 'lead-uuid-123',
      cropType: CropType.SOY,
      areaHectares: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });
  };

  describe('execute', () => {
    it('should return all properties with no filters', async () => {
      const properties = [
        createMockProperty({ id: '1' }),
        createMockProperty({ id: '2' }),
      ];

      mockRuralPropertyRepository.findAll.mockResolvedValue(properties);

      const result = await service.execute({});

      expect(mockRuralPropertyRepository.findAll).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
    });

    it('should filter by leadId', async () => {
      const properties = [createMockProperty({ leadId: 'lead-123' })];

      mockRuralPropertyRepository.findAll.mockResolvedValue(properties);

      const result = await service.execute({ leadId: 'lead-123' });

      expect(mockRuralPropertyRepository.findAll).toHaveBeenCalledWith({ leadId: 'lead-123' });
      expect(result).toHaveLength(1);
      expect(result[0].leadId).toBe('lead-123');
    });

    it('should filter by cropType', async () => {
      const properties = [createMockProperty({ cropType: CropType.COTTON })];

      mockRuralPropertyRepository.findAll.mockResolvedValue(properties);

      const result = await service.execute({ cropType: CropType.COTTON });

      expect(mockRuralPropertyRepository.findAll).toHaveBeenCalledWith({ cropType: CropType.COTTON });
      expect(result).toHaveLength(1);
      expect(result[0].cropType).toBe(CropType.COTTON);
    });

    it('should filter by minArea', async () => {
      const properties = [createMockProperty({ areaHectares: 200 })];

      mockRuralPropertyRepository.findAll.mockResolvedValue(properties);

      const result = await service.execute({ minArea: 150 });

      expect(mockRuralPropertyRepository.findAll).toHaveBeenCalledWith({ minArea: 150 });
      expect(result).toHaveLength(1);
    });

    it('should filter by maxArea', async () => {
      const properties = [createMockProperty({ areaHectares: 50 })];

      mockRuralPropertyRepository.findAll.mockResolvedValue(properties);

      const result = await service.execute({ maxArea: 100 });

      expect(mockRuralPropertyRepository.findAll).toHaveBeenCalledWith({ maxArea: 100 });
      expect(result).toHaveLength(1);
    });

    it('should filter by minArea and maxArea together', async () => {
      const properties = [createMockProperty({ areaHectares: 150 })];

      mockRuralPropertyRepository.findAll.mockResolvedValue(properties);

      const result = await service.execute({ minArea: 100, maxArea: 200 });

      expect(mockRuralPropertyRepository.findAll).toHaveBeenCalledWith({ minArea: 100, maxArea: 200 });
      expect(result).toHaveLength(1);
    });

    it('should filter high priority properties', async () => {
      const properties = [createMockProperty({ areaHectares: 150 })];

      mockRuralPropertyRepository.findAll.mockResolvedValue(properties);

      const result = await service.execute({ highPriorityOnly: true });

      expect(mockRuralPropertyRepository.findAll).toHaveBeenCalledWith({ highPriorityOnly: true });
      expect(result).toHaveLength(1);
    });

    it('should combine multiple filters', async () => {
      const properties = [
        createMockProperty({
          leadId: 'lead-123',
          cropType: CropType.CORN,
          areaHectares: 175,
        }),
      ];

      mockRuralPropertyRepository.findAll.mockResolvedValue(properties);

      const result = await service.execute({
        leadId: 'lead-123',
        cropType: CropType.CORN,
        minArea: 100,
        maxArea: 200,
      });

      expect(mockRuralPropertyRepository.findAll).toHaveBeenCalledWith({
        leadId: 'lead-123',
        cropType: CropType.CORN,
        minArea: 100,
        maxArea: 200,
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no properties match', async () => {
      mockRuralPropertyRepository.findAll.mockResolvedValue([]);

      const result = await service.execute({ leadId: 'nonexistent' });

      expect(result).toEqual([]);
    });
  });

  describe('findByLeadId', () => {
    it('should return properties for specific lead', async () => {
      const properties = [
        createMockProperty({ leadId: 'lead-123' }),
        createMockProperty({ leadId: 'lead-123', id: '2' }),
      ];

      mockRuralPropertyRepository.findByLeadId.mockResolvedValue(properties);

      const result = await service.findByLeadId('lead-123');

      expect(mockRuralPropertyRepository.findByLeadId).toHaveBeenCalledWith('lead-123');
      expect(result).toHaveLength(2);
    });
  });

  describe('findByCropType', () => {
    it('should return properties for specific crop type', async () => {
      const properties = [createMockProperty({ cropType: CropType.SOY })];

      mockRuralPropertyRepository.findByCropType.mockResolvedValue(properties);

      const result = await service.findByCropType(CropType.SOY);

      expect(mockRuralPropertyRepository.findByCropType).toHaveBeenCalledWith(CropType.SOY);
      expect(result).toHaveLength(1);
    });
  });

  describe('findHighPriorityProperties', () => {
    it('should return high priority properties (area > 100)', async () => {
      const properties = [
        createMockProperty({ areaHectares: 150 }),
        createMockProperty({ areaHectares: 200, id: '2' }),
      ];

      mockRuralPropertyRepository.findHighPriorityProperties.mockResolvedValue(properties);

      const result = await service.findHighPriorityProperties();

      expect(mockRuralPropertyRepository.findHighPriorityProperties).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });
});
