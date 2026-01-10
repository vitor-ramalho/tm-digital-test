import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateLeadService } from './create-lead.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';
import { Cpf } from '@domain/leads/cpf.value-object';

describe('CreateLeadService', () => {
  let service: CreateLeadService;
  let repository: LeadRepository;

  const mockLeadRepository = {
    existsByCpf: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateLeadService,
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<CreateLeadService>(CreateLeadService);
    repository = module.get<LeadRepository>(LeadRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validDto = {
      name: 'João Silva',
      cpf: '12345678909', // Valid CPF
      municipality: 'Uberaba',
      comments: 'Test lead',
    };

    it('should create a lead successfully', async () => {
      const expectedLead = new Lead({
        id: 'uuid-123',
        name: validDto.name,
        cpf: '12345678901',
        status: LeadStatus.NEW,
        municipality: validDto.municipality,
        comments: validDto.comments,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockLeadRepository.existsByCpf.mockResolvedValue(false);
      mockLeadRepository.create.mockResolvedValue(expectedLead);

      const result = await service.execute(validDto);

      expect(mockLeadRepository.existsByCpf).toHaveBeenCalledWith('12345678909');
      expect(mockLeadRepository.create).toHaveBeenCalled();
      expect(result).toEqual(expectedLead);
    });

    it('should normalize CPF before checking existence', async () => {
      mockLeadRepository.existsByCpf.mockResolvedValue(false);
      mockLeadRepository.create.mockResolvedValue({} as Lead);

      await service.execute({ ...validDto, cpf: '123.456.789-09' });

      expect(mockLeadRepository.existsByCpf).toHaveBeenCalledWith('12345678909');
    });

    it('should throw ConflictException if CPF already exists', async () => {
      mockLeadRepository.existsByCpf.mockResolvedValue(true);

      await expect(service.execute(validDto)).rejects.toThrow(ConflictException);
      await expect(service.execute(validDto)).rejects.toThrow(
        'CPF 12345678909 is already registered',
      );
      expect(mockLeadRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error for invalid CPF format', async () => {
      const invalidDto = { ...validDto, cpf: '123.456.789-00' };

      await expect(service.execute(invalidDto)).rejects.toThrow();
      expect(mockLeadRepository.existsByCpf).not.toHaveBeenCalled();
      expect(mockLeadRepository.create).not.toHaveBeenCalled();
    });

    it('should create lead without comments if not provided', async () => {
      const dtoWithoutComments = {
        name: 'João Silva',
        cpf: '12345678909',
        municipality: 'Uberaba',
      };

      mockLeadRepository.existsByCpf.mockResolvedValue(false);
      mockLeadRepository.create.mockResolvedValue({} as Lead);

      await service.execute(dtoWithoutComments);

      const createCall = mockLeadRepository.create.mock.calls[0][0];
      expect(createCall.comments).toBeUndefined();
    });

    it('should create lead with provided data', async () => {
      mockLeadRepository.existsByCpf.mockResolvedValue(false);
      mockLeadRepository.create.mockResolvedValue({} as Lead);

      await service.execute(validDto);

      const createCall = mockLeadRepository.create.mock.calls[0][0];
      expect(createCall.name).toBe(validDto.name);
      expect(createCall.cpf).toBe('12345678909');
      expect(createCall.municipality).toBe(validDto.municipality);
      expect(createCall.comments).toBe(validDto.comments);
    });
  });
});
