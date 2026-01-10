import { Test, TestingModule } from '@nestjs/testing';
import { ListLeadsService } from './list-leads.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('ListLeadsService', () => {
  let service: ListLeadsService;
  let repository: LeadRepository;

  const mockLeadRepository = {
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findByMunicipality: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListLeadsService,
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<ListLeadsService>(ListLeadsService);
    repository = module.get<LeadRepository>(LeadRepository);

    jest.clearAllMocks();
  });

  const createMockLeads = (count: number): Lead[] => {
    return Array.from(
      { length: count },
      (_, i) =>
        new Lead({
          id: `uuid-${i}`,
          name: `Lead ${i}`,
          cpf: `1234567890${i}`,
          status: LeadStatus.NEW,
          municipality: 'Uberaba',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    );
  };

  describe('execute', () => {
    it('should return all leads when no filters provided', async () => {
      const mockLeads = createMockLeads(3);
      mockLeadRepository.findAll.mockResolvedValue(mockLeads);

      const result = await service.execute();

      expect(mockLeadRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockLeads);
      expect(result).toHaveLength(3);
    });

    it('should return filtered leads by status', async () => {
      const filters = { status: LeadStatus.NEGOTIATION };
      const mockLeads = createMockLeads(2);
      mockLeadRepository.findAll.mockResolvedValue(mockLeads);

      const result = await service.execute(filters);

      expect(mockLeadRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockLeads);
    });

    it('should return filtered leads by municipality', async () => {
      const filters = { municipality: 'Uberlândia' };
      const mockLeads = createMockLeads(2);
      mockLeadRepository.findAll.mockResolvedValue(mockLeads);

      const result = await service.execute(filters);

      expect(mockLeadRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockLeads);
    });

    it('should return filtered leads by search term', async () => {
      const filters = { search: 'João' };
      const mockLeads = createMockLeads(1);
      mockLeadRepository.findAll.mockResolvedValue(mockLeads);

      const result = await service.execute(filters);

      expect(mockLeadRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockLeads);
    });

    it('should return filtered leads with multiple filters', async () => {
      const filters = {
        status: LeadStatus.NEGOTIATION,
        municipality: 'Uberaba',
        search: 'Silva',
      };
      const mockLeads = createMockLeads(1);
      mockLeadRepository.findAll.mockResolvedValue(mockLeads);

      const result = await service.execute(filters);

      expect(mockLeadRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockLeads);
    });

    it('should return empty array when no leads match filters', async () => {
      mockLeadRepository.findAll.mockResolvedValue([]);

      const result = await service.execute({ status: LeadStatus.CONVERTED });

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findByStatus', () => {
    it('should return leads with specific status', async () => {
      const mockLeads = createMockLeads(2);
      mockLeadRepository.findByStatus.mockResolvedValue(mockLeads);

      const result = await service.findByStatus(LeadStatus.NEGOTIATION);

      expect(mockLeadRepository.findByStatus).toHaveBeenCalledWith(LeadStatus.NEGOTIATION);
      expect(result).toEqual(mockLeads);
    });

    it('should return empty array when no leads have the status', async () => {
      mockLeadRepository.findByStatus.mockResolvedValue([]);

      const result = await service.findByStatus(LeadStatus.LOST);

      expect(result).toEqual([]);
    });
  });

  describe('findByMunicipality', () => {
    it('should return leads from specific municipality', async () => {
      const mockLeads = createMockLeads(3);
      mockLeadRepository.findByMunicipality.mockResolvedValue(mockLeads);

      const result = await service.findByMunicipality('Uberaba');

      expect(mockLeadRepository.findByMunicipality).toHaveBeenCalledWith('Uberaba');
      expect(result).toEqual(mockLeads);
    });

    it('should return empty array when no leads in municipality', async () => {
      mockLeadRepository.findByMunicipality.mockResolvedValue([]);

      const result = await service.findByMunicipality('Unknown City');

      expect(result).toEqual([]);
    });
  });
});
