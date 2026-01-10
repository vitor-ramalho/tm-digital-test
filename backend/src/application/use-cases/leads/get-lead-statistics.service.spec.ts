import { Test, TestingModule } from '@nestjs/testing';
import { GetLeadStatisticsService } from './get-lead-statistics.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('GetLeadStatisticsService', () => {
  let service: GetLeadStatisticsService;
  let repository: LeadRepository;

  const mockLeadRepository = {
    getStatusStatistics: jest.fn(),
    getMunicipalityStatistics: jest.fn(),
    countByStatus: jest.fn(),
    countByMunicipality: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLeadStatisticsService,
        {
          provide: LeadRepository,
          useValue: mockLeadRepository,
        },
      ],
    }).compile();

    service = module.get<GetLeadStatisticsService>(GetLeadStatisticsService);
    repository = module.get<LeadRepository>(LeadRepository);

    jest.clearAllMocks();
  });

  describe('getStatusStatistics', () => {
    it('should return statistics grouped by status', async () => {
      const mockStats = [
        { status: LeadStatus.NEW, count: 10 },
        { status: LeadStatus.NEGOTIATION, count: 5 },
        { status: LeadStatus.CONVERTED, count: 3 },
      ];
      mockLeadRepository.getStatusStatistics.mockResolvedValue(mockStats);

      const result = await service.getStatusStatistics();

      expect(mockLeadRepository.getStatusStatistics).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no leads exist', async () => {
      mockLeadRepository.getStatusStatistics.mockResolvedValue([]);

      const result = await service.getStatusStatistics();

      expect(result).toEqual([]);
    });

    it('should include all status types with counts', async () => {
      const mockStats = [
        { status: LeadStatus.NEW, count: 5 },
        { status: LeadStatus.INITIAL_CONTACT, count: 3 },
        { status: LeadStatus.NEGOTIATION, count: 2 },
        { status: LeadStatus.CONVERTED, count: 1 },
        { status: LeadStatus.LOST, count: 4 },
      ];
      mockLeadRepository.getStatusStatistics.mockResolvedValue(mockStats);

      const result = await service.getStatusStatistics();

      expect(result).toHaveLength(5);
      expect(result.map((s) => s.status)).toContain(LeadStatus.NEW);
      expect(result.map((s) => s.status)).toContain(LeadStatus.CONVERTED);
    });
  });

  describe('getMunicipalityStatistics', () => {
    it('should return statistics grouped by municipality', async () => {
      const mockStats = [
        { municipality: 'Uberaba', count: 15 },
        { municipality: 'Uberlândia', count: 10 },
        { municipality: 'Araguari', count: 5 },
      ];
      mockLeadRepository.getMunicipalityStatistics.mockResolvedValue(mockStats);

      const result = await service.getMunicipalityStatistics();

      expect(mockLeadRepository.getMunicipalityStatistics).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no leads exist', async () => {
      mockLeadRepository.getMunicipalityStatistics.mockResolvedValue([]);

      const result = await service.getMunicipalityStatistics();

      expect(result).toEqual([]);
    });

    it('should handle single municipality', async () => {
      const mockStats = [{ municipality: 'Uberaba', count: 20 }];
      mockLeadRepository.getMunicipalityStatistics.mockResolvedValue(mockStats);

      const result = await service.getMunicipalityStatistics();

      expect(result).toHaveLength(1);
      expect(result[0].municipality).toBe('Uberaba');
      expect(result[0].count).toBe(20);
    });
  });

  describe('countByStatus', () => {
    it('should return count for specific status', async () => {
      mockLeadRepository.countByStatus.mockResolvedValue(7);

      const result = await service.countByStatus(LeadStatus.NEGOTIATION);

      expect(mockLeadRepository.countByStatus).toHaveBeenCalledWith(LeadStatus.NEGOTIATION);
      expect(result).toBe(7);
    });

    it('should return zero for status with no leads', async () => {
      mockLeadRepository.countByStatus.mockResolvedValue(0);

      const result = await service.countByStatus(LeadStatus.LOST);

      expect(result).toBe(0);
    });

    it('should work for all status types', async () => {
      const statuses = [
        LeadStatus.NEW,
        LeadStatus.INITIAL_CONTACT,
        LeadStatus.NEGOTIATION,
        LeadStatus.CONVERTED,
        LeadStatus.LOST,
      ];

      for (const status of statuses) {
        mockLeadRepository.countByStatus.mockResolvedValue(5);
        const result = await service.countByStatus(status);
        expect(mockLeadRepository.countByStatus).toHaveBeenCalledWith(status);
        expect(result).toBe(5);
      }
    });
  });

  describe('countByMunicipality', () => {
    it('should return count for specific municipality', async () => {
      mockLeadRepository.countByMunicipality.mockResolvedValue(12);

      const result = await service.countByMunicipality('Uberaba');

      expect(mockLeadRepository.countByMunicipality).toHaveBeenCalledWith('Uberaba');
      expect(result).toBe(12);
    });

    it('should return zero for municipality with no leads', async () => {
      mockLeadRepository.countByMunicipality.mockResolvedValue(0);

      const result = await service.countByMunicipality('Unknown City');

      expect(result).toBe(0);
    });

    it('should handle different municipality names', async () => {
      const municipalities = ['Uberaba', 'Uberlândia', 'Araguari'];

      for (const municipality of municipalities) {
        mockLeadRepository.countByMunicipality.mockResolvedValue(8);
        const result = await service.countByMunicipality(municipality);
        expect(mockLeadRepository.countByMunicipality).toHaveBeenCalledWith(municipality);
        expect(result).toBe(8);
      }
    });
  });
});
