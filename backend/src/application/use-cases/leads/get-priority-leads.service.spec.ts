import { Test, TestingModule } from '@nestjs/testing';
import { GetPriorityLeadsService } from './get-priority-leads.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('GetPriorityLeadsService', () => {
  let service: GetPriorityLeadsService;
  let repository: LeadRepository;

  const mockLeadRepository = {
    findHighPriorityLeads: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPriorityLeadsService,
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<GetPriorityLeadsService>(GetPriorityLeadsService);
    repository = module.get<LeadRepository>(LeadRepository);

    jest.clearAllMocks();
  });

  const createMockLead = (id: string, name: string): Lead => {
    return new Lead({
      id,
      name,
      cpf: `12345678901`,
      status: LeadStatus.NEGOTIATION,
      municipality: 'Uberaba',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('execute', () => {
    it('should return high priority leads', async () => {
      const mockLeads = [
        createMockLead('uuid-1', 'Lead with large property'),
        createMockLead('uuid-2', 'Another priority lead'),
      ];
      mockLeadRepository.findHighPriorityLeads.mockResolvedValue(mockLeads);

      const result = await service.execute();

      expect(mockLeadRepository.findHighPriorityLeads).toHaveBeenCalled();
      expect(result).toEqual(mockLeads);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no priority leads exist', async () => {
      mockLeadRepository.findHighPriorityLeads.mockResolvedValue([]);

      const result = await service.execute();

      expect(mockLeadRepository.findHighPriorityLeads).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should call repository method without parameters', async () => {
      mockLeadRepository.findHighPriorityLeads.mockResolvedValue([]);

      await service.execute();

      expect(mockLeadRepository.findHighPriorityLeads).toHaveBeenCalledWith();
    });
  });
});
