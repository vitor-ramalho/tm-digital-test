import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateRuralPropertyService } from './update-rural-property.service';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('UpdateRuralPropertyService', () => {
  let service: UpdateRuralPropertyService;
  let ruralPropertyRepository: RuralPropertyRepository;
  let leadRepository: LeadRepository;

  const mockRuralPropertyRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockLeadRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRuralPropertyService,
        {
          provide: RuralPropertyRepository,
          useValue: mockRuralPropertyRepository,
        },
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<UpdateRuralPropertyService>(UpdateRuralPropertyService);
    ruralPropertyRepository = module.get<RuralPropertyRepository>(RuralPropertyRepository);
    leadRepository = module.get<LeadRepository>(LeadRepository);

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

  const createMockLead = (): Lead => {
    return new Lead({
      id: 'lead-uuid-456',
      name: 'João Silva',
      cpf: '12345678901',
      status: LeadStatus.NEW,
      municipality: 'Uberaba',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('execute', () => {
    it('should update property successfully', async () => {
      const existing = createMockProperty();
      const updateDto = { areaHectares: 200 };
      const updated = createMockProperty({ areaHectares: 200 });

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockRuralPropertyRepository.update.mockResolvedValue(updated);

      const result = await service.execute('property-uuid-123', updateDto);

      expect(mockRuralPropertyRepository.findById).toHaveBeenCalledWith('property-uuid-123');
      expect(mockRuralPropertyRepository.update).toHaveBeenCalledWith(
        'property-uuid-123',
        updateDto,
      );
      expect(result.areaHectares).toBe(200);
    });

    it('should throw NotFoundException if property does not exist', async () => {
      mockRuralPropertyRepository.findById.mockResolvedValue(null);

      await expect(service.execute('nonexistent', { areaHectares: 100 })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.execute('nonexistent', { areaHectares: 100 })).rejects.toThrow(
        'Rural property with ID nonexistent not found',
      );
      expect(mockRuralPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should validate and check new leadId exists', async () => {
      const existing = createMockProperty({ leadId: 'lead-uuid-123' });
      const newLead = createMockLead();
      const updateDto = { leadId: 'lead-uuid-456' };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.findById.mockResolvedValue(newLead);
      mockRuralPropertyRepository.update.mockResolvedValue(existing);

      await service.execute('property-uuid-123', updateDto);

      expect(mockLeadRepository.findById).toHaveBeenCalledWith('lead-uuid-456');
      expect(mockRuralPropertyRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if new leadId does not exist', async () => {
      const existing = createMockProperty({ leadId: 'lead-uuid-123' });
      const updateDto = { leadId: 'nonexistent-lead' };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.findById.mockResolvedValue(null);

      await expect(service.execute('property-uuid-123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.execute('property-uuid-123', updateDto)).rejects.toThrow(
        'Lead with ID nonexistent-lead not found',
      );
      expect(mockRuralPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should not check leadId if not changing', async () => {
      const existing = createMockProperty({ leadId: 'lead-uuid-123' });
      const updateDto = { areaHectares: 180 };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockRuralPropertyRepository.update.mockResolvedValue(existing);

      await service.execute('property-uuid-123', updateDto);

      expect(mockLeadRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for zero area', async () => {
      const existing = createMockProperty();
      const updateDto = { areaHectares: 0 };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);

      await expect(service.execute('property-uuid-123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.execute('property-uuid-123', updateDto)).rejects.toThrow(
        'Area must be a positive number greater than 0',
      );
      expect(mockRuralPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for negative area', async () => {
      const existing = createMockProperty();
      const updateDto = { areaHectares: -50 };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);

      await expect(service.execute('property-uuid-123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRuralPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should update crop type', async () => {
      const existing = createMockProperty({ cropType: CropType.SOY });
      const updateDto = { cropType: CropType.COTTON };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockRuralPropertyRepository.update.mockResolvedValue(existing);

      await service.execute('property-uuid-123', updateDto);

      expect(mockRuralPropertyRepository.update).toHaveBeenCalledWith(
        'property-uuid-123',
        updateDto,
      );
    });

    it('should update geometry', async () => {
      const existing = createMockProperty();
      const updateDto = { geometry: '{"type":"Polygon","coordinates":[]}' };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockRuralPropertyRepository.update.mockResolvedValue(existing);

      await service.execute('property-uuid-123', updateDto);

      expect(mockRuralPropertyRepository.update).toHaveBeenCalledWith(
        'property-uuid-123',
        updateDto,
      );
    });

    it('should update multiple fields at once', async () => {
      const existing = createMockProperty();
      const newLead = createMockLead();
      const updateDto = {
        leadId: 'lead-uuid-456',
        cropType: CropType.CORN,
        areaHectares: 180,
      };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.findById.mockResolvedValue(newLead);
      mockRuralPropertyRepository.update.mockResolvedValue(existing);

      await service.execute('property-uuid-123', updateDto);

      expect(mockRuralPropertyRepository.update).toHaveBeenCalledWith(
        'property-uuid-123',
        updateDto,
      );
    });

    it('should throw NotFoundException if update returns null', async () => {
      const existing = createMockProperty();
      const updateDto = { areaHectares: 100 };

      mockRuralPropertyRepository.findById.mockResolvedValue(existing);
      mockRuralPropertyRepository.update.mockResolvedValue(null);

      await expect(service.execute('property-uuid-123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.execute('property-uuid-123', updateDto)).rejects.toThrow(
        'Failed to update rural property with ID property-uuid-123',
      );
    });
  });
});
