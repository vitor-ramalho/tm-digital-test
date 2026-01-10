import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UpdateLeadService } from './update-lead.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('UpdateLeadService', () => {
  let service: UpdateLeadService;
  let repository: LeadRepository;

  const mockLeadRepository = {
    findById: jest.fn(),
    existsByCpf: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateLeadService,
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<UpdateLeadService>(UpdateLeadService);
    repository = module.get<LeadRepository>(LeadRepository);

    jest.clearAllMocks();
  });

  const createMockLead = (overrides?: Partial<Lead>): Lead => {
    return new Lead({
      id: 'uuid-123',
      name: 'João Silva',
      cpf: '12345678901',
      status: LeadStatus.NEW,
      municipality: 'Uberaba',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });
  };

  describe('execute', () => {
    it('should update lead successfully', async () => {
      const existing = createMockLead();
      const updateDto = { name: 'João Updated' };
      const updated = createMockLead({ name: 'João Updated' });

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.update.mockResolvedValue(updated);

      const result = await service.execute('uuid-123', updateDto);

      expect(mockLeadRepository.findById).toHaveBeenCalledWith('uuid-123');
      expect(mockLeadRepository.update).toHaveBeenCalledWith('uuid-123', updateDto);
      expect(result.name).toBe('João Updated');
    });

    it('should throw NotFoundException if lead does not exist', async () => {
      mockLeadRepository.findById.mockResolvedValue(null);

      await expect(service.execute('nonexistent', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.execute('nonexistent', { name: 'Test' })).rejects.toThrow(
        'Lead with ID nonexistent not found',
      );
      expect(mockLeadRepository.update).not.toHaveBeenCalled();
    });

    it('should validate and normalize CPF when changing it', async () => {
      const existing = createMockLead({ cpf: '12345678901' });
      const updateDto = { cpf: '987.654.321-00' };

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.existsByCpf.mockResolvedValue(false);
      mockLeadRepository.update.mockResolvedValue(existing);

      await service.execute('uuid-123', updateDto);

      expect(mockLeadRepository.existsByCpf).toHaveBeenCalledWith('98765432100', 'uuid-123');
      expect(mockLeadRepository.update).toHaveBeenCalledWith('uuid-123', {
        cpf: '98765432100',
      });
    });

    it('should throw ConflictException if new CPF already exists', async () => {
      const existing = createMockLead({ cpf: '12345678901' });
      const updateDto = { cpf: '987.654.321-00' };

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.existsByCpf.mockResolvedValue(true);

      await expect(service.execute('uuid-123', updateDto)).rejects.toThrow(ConflictException);
      await expect(service.execute('uuid-123', updateDto)).rejects.toThrow(
        'CPF 987.654.321-00 is already registered',
      );
      expect(mockLeadRepository.update).not.toHaveBeenCalled();
    });

    it('should not check CPF existence if CPF is not changing', async () => {
      const existing = createMockLead({ cpf: '12345678901' });
      const updateDto = { name: 'New Name' };

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.update.mockResolvedValue(existing);

      await service.execute('uuid-123', updateDto);

      expect(mockLeadRepository.existsByCpf).not.toHaveBeenCalled();
    });

    it('should throw error for invalid CPF format', async () => {
      const existing = createMockLead();
      const updateDto = { cpf: '123.456.789-00' };

      mockLeadRepository.findById.mockResolvedValue(existing);

      await expect(service.execute('uuid-123', updateDto)).rejects.toThrow();
      expect(mockLeadRepository.update).not.toHaveBeenCalled();
    });

    it('should validate status transitions', async () => {
      const existing = createMockLead({ status: LeadStatus.NEW });
      const updateDto = { status: LeadStatus.NEGOTIATION };

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.update.mockResolvedValue(existing);

      await service.execute('uuid-123', updateDto);

      expect(mockLeadRepository.update).toHaveBeenCalled();
    });

    it('should prevent invalid status transition from LOST', async () => {
      const existing = createMockLead({ status: LeadStatus.LOST });
      const updateDto = { status: LeadStatus.NEGOTIATION };

      mockLeadRepository.findById.mockResolvedValue(existing);

      await expect(service.execute('uuid-123', updateDto)).rejects.toThrow(ConflictException);
      await expect(service.execute('uuid-123', updateDto)).rejects.toThrow(
        'Cannot change status from LOST',
      );
    });

    it('should prevent invalid status transition from CONVERTED', async () => {
      const existing = createMockLead({ status: LeadStatus.CONVERTED });
      const updateDto = { status: LeadStatus.NEGOTIATION };

      mockLeadRepository.findById.mockResolvedValue(existing);

      await expect(service.execute('uuid-123', updateDto)).rejects.toThrow(ConflictException);
      await expect(service.execute('uuid-123', updateDto)).rejects.toThrow(
        'CONVERTED leads can only be marked as LOST',
      );
    });

    it('should allow transition from NEW to INITIAL_CONTACT', async () => {
      const existing = createMockLead({ status: LeadStatus.NEW });
      const updateDto = { status: LeadStatus.INITIAL_CONTACT };

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.update.mockResolvedValue(existing);

      await service.execute('uuid-123', updateDto);

      expect(mockLeadRepository.update).toHaveBeenCalled();
    });

    it('should allow transition to LOST from any non-terminal state', async () => {
      const existing = createMockLead({ status: LeadStatus.NEGOTIATION });
      const updateDto = { status: LeadStatus.LOST };

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.update.mockResolvedValue(existing);

      await service.execute('uuid-123', updateDto);

      expect(mockLeadRepository.update).toHaveBeenCalled();
    });

    it('should update multiple fields at once', async () => {
      const existing = createMockLead();
      const updateDto = {
        name: 'New Name',
        municipality: 'Uberlândia',
        comments: 'Updated comments',
      };

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.update.mockResolvedValue(existing);

      await service.execute('uuid-123', updateDto);

      expect(mockLeadRepository.update).toHaveBeenCalledWith('uuid-123', updateDto);
    });

    it('should throw NotFoundException if update returns null', async () => {
      const existing = createMockLead();
      const updateDto = { name: 'Test' };

      mockLeadRepository.findById.mockResolvedValue(existing);
      mockLeadRepository.update.mockResolvedValue(null);

      await expect(service.execute('uuid-123', updateDto)).rejects.toThrow(NotFoundException);
    });
  });
});
