import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteRuralPropertyService } from './delete-rural-property.service';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';

describe('DeleteRuralPropertyService', () => {
  let service: DeleteRuralPropertyService;
  let ruralPropertyRepository: RuralPropertyRepository;

  const mockRuralPropertyRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRuralPropertyService,
        {
          provide: RuralPropertyRepository,
          useValue: mockRuralPropertyRepository,
        },
      ],
    }).compile();

    service = module.get<DeleteRuralPropertyService>(DeleteRuralPropertyService);
    ruralPropertyRepository = module.get<RuralPropertyRepository>(RuralPropertyRepository);

    jest.clearAllMocks();
  });

  const createMockProperty = (): RuralProperty => {
    return new RuralProperty({
      id: 'property-uuid-123',
      leadId: 'lead-uuid-123',
      cropType: CropType.SOY,
      areaHectares: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('execute', () => {
    it('should delete property successfully', async () => {
      const existing = createMockProperty();

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockRuralPropertyRepository.delete.mockResolvedValue(true);

      await service.execute('property-uuid-123');

      expect(mockRuralPropertyRepository.findById).toHaveBeenCalledWith('property-uuid-123');
      expect(mockRuralPropertyRepository.delete).toHaveBeenCalledWith('property-uuid-123');
    });

    it('should throw NotFoundException if property does not exist', async () => {
      mockRuralPropertyRepository.findById.mockResolvedValue(null);

      await expect(service.execute('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.execute('nonexistent')).rejects.toThrow(
        'Rural property with ID nonexistent not found',
      );
      expect(mockRuralPropertyRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if deletion fails', async () => {
      const existing = createMockProperty();

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockRuralPropertyRepository.delete.mockResolvedValue(false);

      await expect(service.execute('property-uuid-123')).rejects.toThrow(NotFoundException);
      await expect(service.execute('property-uuid-123')).rejects.toThrow(
        'Failed to delete rural property with ID property-uuid-123',
      );
    });

    it('should return void on successful deletion', async () => {
      const existing = createMockProperty();

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockRuralPropertyRepository.delete.mockResolvedValue(true);

      const result = await service.execute('property-uuid-123');

      expect(result).toBeUndefined();
    });
  });
});
