import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetRuralPropertyService } from './get-rural-property.service';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';

describe('GetRuralPropertyService', () => {
  let service: GetRuralPropertyService;
  let ruralPropertyRepository: RuralPropertyRepository;

  const mockRuralPropertyRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRuralPropertyService,
        {
          provide: RuralPropertyRepository,
          useValue: mockRuralPropertyRepository,
        },
      ],
    }).compile();

    service = module.get<GetRuralPropertyService>(GetRuralPropertyService);
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
    it('should return property when found', async () => {
      const mockProperty = createMockProperty();

      mockRuralPropertyRepository.findById.mockResolvedValue(mockProperty);

      const result = await service.execute('property-uuid-123');

      expect(mockRuralPropertyRepository.findById).toHaveBeenCalledWith('property-uuid-123');
      expect(result).toEqual(mockProperty);
      expect(result.id).toBe('property-uuid-123');
    });

    it('should throw NotFoundException when property not found', async () => {
      mockRuralPropertyRepository.findById.mockResolvedValue(null);

      await expect(service.execute('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.execute('nonexistent')).rejects.toThrow(
        'Rural property with ID nonexistent not found',
      );
    });

    it('should return property with all fields correctly', async () => {
      const mockProperty = createMockProperty({
        cropType: CropType.COTTON,
        areaHectares: 250,
        geometry: '{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}',
      });

      mockRuralPropertyRepository.findById.mockResolvedValue(mockProperty);

      const result = await service.execute('property-uuid-123');

      expect(result.cropType).toBe(CropType.COTTON);
      expect(result.areaHectares).toBe(250);
      expect(result.geometry).toBeDefined();
    });
  });
});
