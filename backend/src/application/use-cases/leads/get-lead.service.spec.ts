import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetLeadService } from './get-lead.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('GetLeadService', () => {
  let service: GetLeadService;
  let repository: LeadRepository;

  const mockLeadRepository = {
    findById: jest.fn(),
    findByIdWithPropertiesCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLeadService,
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<GetLeadService>(GetLeadService);
    repository = module.get<LeadRepository>(LeadRepository);

    jest.clearAllMocks();
  });

  const createMockLead = (): Lead => {
    return new Lead({
      id: 'uuid-123',
      name: 'João Silva',
      cpf: '12345678901',
      status: LeadStatus.NEW,
      municipality: 'Uberaba',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('execute', () => {
    it('should return lead when found', async () => {
      const mockLead = createMockLead();
      mockLeadRepository.findById.mockResolvedValue(mockLead);

      const result = await service.execute('uuid-123');

      expect(mockLeadRepository.findById).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockLead);
    });

    it('should throw NotFoundException when lead not found', async () => {
      mockLeadRepository.findById.mockResolvedValue(null);

      await expect(service.execute('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.execute('nonexistent')).rejects.toThrow(
        'Lead with ID nonexistent not found',
      );
    });
  });

  describe('getWithPropertiesCount', () => {
    it('should return lead with properties count', async () => {
      const mockLead = createMockLead();
      const mockResult = {
        lead: mockLead,
        propertiesCount: 5,
      };
      mockLeadRepository.findByIdWithPropertiesCount.mockResolvedValue(mockResult);

      const result = await service.getWithPropertiesCount('uuid-123');

      expect(mockLeadRepository.findByIdWithPropertiesCount).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockResult);
      expect(result.propertiesCount).toBe(5);
    });

    it('should throw NotFoundException when lead not found', async () => {
      mockLeadRepository.findByIdWithPropertiesCount.mockResolvedValue(null);

      await expect(service.getWithPropertiesCount('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getWithPropertiesCount('nonexistent')).rejects.toThrow(
        'Lead with ID nonexistent not found',
      );
    });

    it('should return zero count when lead has no properties', async () => {
      const mockLead = createMockLead();
      const mockResult = {
        lead: mockLead,
        propertiesCount: 0,
      };
      mockLeadRepository.findByIdWithPropertiesCount.mockResolvedValue(mockResult);

      const result = await service.getWithPropertiesCount('uuid-123');

      expect(result.propertiesCount).toBe(0);
    });
  });
});
