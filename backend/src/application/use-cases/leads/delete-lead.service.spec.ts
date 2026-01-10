import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteLeadService } from './delete-lead.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('DeleteLeadService', () => {
  let service: DeleteLeadService;
  let repository: LeadRepository;

  const mockLeadRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteLeadService,
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<DeleteLeadService>(DeleteLeadService);
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
    it('should delete lead successfully', async () => {
      const existing = createMockLead();
      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.delete.mockResolvedValue(true);

      await service.execute('uuid-123');

      expect(mockLeadRepository.findById).toHaveBeenCalledWith('uuid-123');
      expect(mockLeadRepository.delete).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw NotFoundException if lead does not exist', async () => {
      mockLeadRepository.findById.mockResolvedValue(null);

      await expect(service.execute('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.execute('nonexistent')).rejects.toThrow(
        'Lead with ID nonexistent not found',
      );
      expect(mockLeadRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delete operation fails', async () => {
      const existing = createMockLead();
      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.delete.mockResolvedValue(false);

      await expect(service.execute('uuid-123')).rejects.toThrow(NotFoundException);
      await expect(service.execute('uuid-123')).rejects.toThrow(
        'Failed to delete lead with ID uuid-123',
      );
    });

    it('should not throw if lead exists and delete succeeds', async () => {
      const existing = createMockLead();
      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.delete.mockResolvedValue(true);

      await expect(service.execute('uuid-123')).resolves.not.toThrow();
    });
  });
});
