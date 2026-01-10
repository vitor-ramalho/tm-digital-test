import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateRuralPropertyService } from './create-rural-property.service';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('CreateRuralPropertyService', () => {
  let service: CreateRuralPropertyService;
  let ruralPropertyRepository: RuralPropertyRepository;
  let leadRepository: LeadRepository;

  const mockRuralPropertyRepository = {
    create: jest.fn(),
  };

  const mockLeadRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRuralPropertyService,
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

    service = module.get<CreateRuralPropertyService>(CreateRuralPropertyService);
    ruralPropertyRepository = module.get<RuralPropertyRepository>(RuralPropertyRepository);
    leadRepository = module.get<LeadRepository>(LeadRepository);

    jest.clearAllMocks();
  });

  const createMockLead = (): Lead => {
    return new Lead({
      id: 'lead-uuid-123',
      name: 'João Silva',
      cpf: '12345678901',
      status: LeadStatus.NEW,
      municipality: 'Uberaba',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('execute', () => {
    const validDto = {
      leadId: 'lead-uuid-123',
      cropType: CropType.SOY,
      areaHectares: 150,
      geometry: '{"type":"Point","coordinates":[-47.9,-18.9]}',
    };

    it('should create rural property successfully', async () => {
      const mockLead = createMockLead();
      const expectedProperty = new RuralProperty({
        id: 'property-uuid-123',
        leadId: validDto.leadId,
        cropType: validDto.cropType,
        areaHectares: validDto.areaHectares,
        geometry: validDto.geometry,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockLeadRepository.findById.mockResolvedValue(mockLead);
      mockRuralPropertyRepository.create.mockResolvedValue(expectedProperty);

      const result = await service.execute(validDto);

      expect(mockLeadRepository.findById).toHaveBeenCalledWith('lead-uuid-123');
      expect(mockRuralPropertyRepository.create).toHaveBeenCalled();
      expect(result).toEqual(expectedProperty);
    });

    it('should throw NotFoundException if lead does not exist', async () => {
      mockLeadRepository.findById.mockResolvedValue(null);

      await expect(service.execute(validDto)).rejects.toThrow(NotFoundException);
      await expect(service.execute(validDto)).rejects.toThrow(
        'Lead with ID lead-uuid-123 not found',
      );
      expect(mockRuralPropertyRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for zero area', async () => {
      const mockLead = createMockLead();
      const invalidDto = { ...validDto, areaHectares: 0 };

      mockLeadRepository.findById.mockResolvedValue(mockLead);

      await expect(service.execute(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.execute(invalidDto)).rejects.toThrow(
        'Area must be a positive number greater than 0',
      );
      expect(mockRuralPropertyRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for negative area', async () => {
      const mockLead = createMockLead();
      const invalidDto = { ...validDto, areaHectares: -50 };

      mockLeadRepository.findById.mockResolvedValue(mockLead);

      await expect(service.execute(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockRuralPropertyRepository.create).not.toHaveBeenCalled();
    });

    it('should create property without geometry if not provided', async () => {
      const mockLead = createMockLead();
      const dtoWithoutGeometry = {
        leadId: 'lead-uuid-123',
        cropType: CropType.CORN,
        areaHectares: 75,
      };

      mockLeadRepository.findById.mockResolvedValue(mockLead);
      mockRuralPropertyRepository.create.mockResolvedValue({} as RuralProperty);

      await service.execute(dtoWithoutGeometry);

      expect(mockRuralPropertyRepository.create).toHaveBeenCalled();
      const createCall = mockRuralPropertyRepository.create.mock.calls[0][0];
      expect(createCall.geometry).toBeUndefined();
    });

    it('should accept all crop types', async () => {
      const mockLead = createMockLead();
      mockLeadRepository.findById.mockResolvedValue(mockLead);
      mockRuralPropertyRepository.create.mockResolvedValue({} as RuralProperty);

      const cropTypes = [CropType.SOY, CropType.CORN, CropType.COTTON];

      for (const cropType of cropTypes) {
        const dto = { ...validDto, cropType };
        await service.execute(dto);
        expect(mockRuralPropertyRepository.create).toHaveBeenCalled();
      }
    });

    it('should create high priority property (area > 100)', async () => {
      const mockLead = createMockLead();
      const highPriorityDto = { ...validDto, areaHectares: 200 };

      mockLeadRepository.findById.mockResolvedValue(mockLead);
      mockRuralPropertyRepository.create.mockResolvedValue({} as RuralProperty);

      await service.execute(highPriorityDto);

      const createCall = mockRuralPropertyRepository.create.mock.calls[0][0];
      expect(createCall.areaHectares).toBe(200);
      expect(createCall.isHighPriority()).toBe(true);
    });

    it('should create non-priority property (area <= 100)', async () => {
      const mockLead = createMockLead();
      const normalDto = { ...validDto, areaHectares: 50 };

      mockLeadRepository.findById.mockResolvedValue(mockLead);
      mockRuralPropertyRepository.create.mockResolvedValue({} as RuralProperty);

      await service.execute(normalDto);

      const createCall = mockRuralPropertyRepository.create.mock.calls[0][0];
      expect(createCall.areaHectares).toBe(50);
      expect(createCall.isHighPriority()).toBe(false);
    });
  });
});
