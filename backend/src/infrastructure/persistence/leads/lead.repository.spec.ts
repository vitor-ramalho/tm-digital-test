import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LeadRepository } from './lead.repository';
import { LeadEntity } from './lead.entity';
import { LeadMapper } from './lead.mapper';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';

describe('LeadRepository', () => {
  let repository: LeadRepository;
  let typeormRepository: Repository<LeadEntity>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getCount: jest.fn(),
    distinct: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockTypeormRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadRepository,
        {
          provide: getRepositoryToken(LeadEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<LeadRepository>(LeadRepository);
    typeormRepository = module.get<Repository<LeadEntity>>(
      getRepositoryToken(LeadEntity),
    );

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all leads without filters', async () => {
      const entities = [createLeadEntity(), createLeadEntity()];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(mockTypeormRepository.createQueryBuilder).toHaveBeenCalledWith('lead');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('lead.created_at', 'DESC');
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Lead);
    });

    it('should filter by status', async () => {
      const entities = [createLeadEntity({ status: LeadStatus.NEGOTIATION })];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll({ status: LeadStatus.NEGOTIATION });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lead.status = :status',
        { status: LeadStatus.NEGOTIATION },
      );
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(LeadStatus.NEGOTIATION);
    });

    it('should filter by municipality', async () => {
      const entities = [createLeadEntity({ municipality: 'Uberaba' })];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll({ municipality: 'Uberaba' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lead.municipality = :municipality',
        { municipality: 'Uberaba' },
      );
      expect(result).toHaveLength(1);
    });

    it('should filter by search text', async () => {
      const entities = [createLeadEntity({ name: 'João Silva' })];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findAll({ search: 'João' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(lead.name ILIKE :search OR lead.cpf LIKE :search)',
        { search: '%João%' },
      );
      expect(result).toHaveLength(1);
    });

    it('should combine multiple filters', async () => {
      const entities = [createLeadEntity()];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      await repository.findAll({
        status: LeadStatus.NEGOTIATION,
        municipality: 'Uberaba',
        search: 'João',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findById', () => {
    it('should return lead when found', async () => {
      const entity = createLeadEntity();
      mockTypeormRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findById('uuid-123');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result).toBeInstanceOf(Lead);
      expect(result?.id).toBe(entity.id);
    });

    it('should return null when not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByCpf', () => {
    it('should normalize CPF and find lead', async () => {
      const entity = createLeadEntity({ cpf: '12345678901' });
      mockTypeormRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findByCpf('123.456.789-01');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { cpf: '12345678901' },
      });
      expect(result).toBeInstanceOf(Lead);
    });

    it('should return null when CPF not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByCpf('123.456.789-01');

      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should return leads with specific status', async () => {
      const entities = [
        createLeadEntity({ status: LeadStatus.CONVERTED }),
        createLeadEntity({ status: LeadStatus.CONVERTED }),
      ];
      mockTypeormRepository.find.mockResolvedValue(entities);

      const result = await repository.findByStatus(LeadStatus.CONVERTED);

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { status: LeadStatus.CONVERTED },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('should create and return new lead', async () => {
      const domainLead = createDomainLead();
      const entity = createLeadEntity();
      mockTypeormRepository.save.mockResolvedValue(entity);

      const result = await repository.create(domainLead);

      expect(mockTypeormRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Lead);
    });

    it('should throw error if mapper fails', async () => {
      const domainLead = createDomainLead();
      jest.spyOn(LeadMapper, 'toInfrastructure').mockReturnValue(null);

      await expect(repository.create(domainLead)).rejects.toThrow(
        'Failed to map lead to infrastructure entity',
      );
    });
  });

  describe('update', () => {
    it('should update existing lead', async () => {
      const existing = createLeadEntity();
      const updated = { ...existing, name: 'Updated Name' };
      mockTypeormRepository.findOne.mockResolvedValue(existing);
      mockTypeormRepository.save.mockResolvedValue(updated);

      const result = await repository.update('uuid-123', {
        name: 'Updated Name',
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Updated Name');
    });

    it('should return null when lead not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.update('nonexistent', { name: 'Test' });

      expect(result).toBeNull();
    });

    it('should update only provided fields', async () => {
      const existing = createLeadEntity();
      mockTypeormRepository.findOne.mockResolvedValue(existing);
      mockTypeormRepository.save.mockResolvedValue(existing);

      await repository.update('uuid-123', {
        status: LeadStatus.CONVERTED,
      });

      expect(existing.status).toBe(LeadStatus.CONVERTED);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(existing);
    });

    it('should not update fields that are not provided', async () => {
      const existing = createLeadEntity({ comments: 'Old comment' });
      mockTypeormRepository.findOne.mockResolvedValue(existing);
      mockTypeormRepository.save.mockResolvedValue(existing);

      await repository.update('uuid-123', { name: 'New Name' });

      expect(mockTypeormRepository.save).toHaveBeenCalled();
      const savedEntity = mockTypeormRepository.save.mock.calls[0][0];
      expect(savedEntity.name).toBe('New Name');
      expect(savedEntity.comments).toBe('Old comment'); // Should remain unchanged
    });
  });

  describe('delete', () => {
    it('should return true when delete succeeds', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await repository.delete('uuid-123');

      expect(result).toBe(true);
      expect(mockTypeormRepository.delete).toHaveBeenCalledWith('uuid-123');
    });

    it('should return false when nothing deleted', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      const result = await repository.delete('nonexistent');

      expect(result).toBe(false);
    });

    it('should handle null affected count', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: null, raw: {} });

      const result = await repository.delete('uuid-123');

      expect(result).toBe(false);
    });
  });

  describe('existsByCpf', () => {
    it('should return true when CPF exists', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await repository.existsByCpf('123.456.789-01');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'lead.cpf = :cpf',
        { cpf: '12345678901' },
      );
      expect(result).toBe(true);
    });

    it('should return false when CPF not found', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);

      const result = await repository.existsByCpf('123.456.789-01');

      expect(result).toBe(false);
    });

    it('should exclude specific lead ID', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);

      await repository.existsByCpf('123.456.789-01', 'uuid-exclude');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lead.id != :id',
        { id: 'uuid-exclude' },
      );
    });
  });

  describe('countByStatus', () => {
    it('should count by status', async () => {
      mockTypeormRepository.count.mockResolvedValue(10);

      const result = await repository.countByStatus(LeadStatus.NEGOTIATION);

      expect(mockTypeormRepository.count).toHaveBeenCalledWith({
        where: { status: LeadStatus.NEGOTIATION },
      });
      expect(result).toBe(10);
    });
  });

  describe('countByMunicipality', () => {
    it('should count by municipality', async () => {
      mockTypeormRepository.count.mockResolvedValue(15);

      const result = await repository.countByMunicipality('Uberaba');

      expect(mockTypeormRepository.count).toHaveBeenCalledWith({
        where: { municipality: 'Uberaba' },
      });
      expect(result).toBe(15);
    });
  });

  describe('findHighPriorityLeads', () => {
    it('should return leads with high priority properties', async () => {
      const entities = [createLeadEntity()];
      mockQueryBuilder.getMany.mockResolvedValue(entities);

      const result = await repository.findHighPriorityLeads();

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'lead.properties',
        'property',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'property.area_hectares > 100',
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('findByIdWithPropertiesCount', () => {
    it('should return lead with properties count', async () => {
      const entity = Object.assign(createLeadEntity(), { propertiesCount: 5 });
      mockQueryBuilder.getOne.mockResolvedValue(entity);

      const result = await repository.findByIdWithPropertiesCount('uuid-123');

      expect(result).not.toBeNull();
      expect(result?.propertiesCount).toBe(5);
      expect(result?.lead).toBeInstanceOf(Lead);
    });

    it('should return null when lead not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await repository.findByIdWithPropertiesCount('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle null mapper result', async () => {
      const entity = createLeadEntity();
      mockQueryBuilder.getOne.mockResolvedValue(entity);
      jest.spyOn(LeadMapper, 'toDomain').mockReturnValue(null);

      const result = await repository.findByIdWithPropertiesCount('uuid-123');

      expect(result).toBeNull();
    });
  });

  describe('getStatusStatistics', () => {
    it('should return statistics grouped by status', async () => {
      const stats = [
        { status: LeadStatus.NEW, count: '5' },
        { status: LeadStatus.NEGOTIATION, count: '3' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(stats);

      const result = await repository.getStatusStatistics();

      expect(mockQueryBuilder.select).toHaveBeenCalledWith('lead.status', 'status');
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('lead.status');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ status: LeadStatus.NEW, count: 5 });
    });
  });

  describe('getMunicipalityStatistics', () => {
    it('should return statistics grouped by municipality', async () => {
      const stats = [
        { municipality: 'Uberaba', count: '10' },
        { municipality: 'Uberlândia', count: '8' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(stats);

      const result = await repository.getMunicipalityStatistics();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ municipality: 'Uberaba', count: 10 });
    });
  });

  // Helper functions
  function createLeadEntity(overrides?: Partial<LeadEntity>): LeadEntity {
    const entity = new LeadEntity();
    entity.id = overrides?.id || 'uuid-123';
    entity.name = overrides?.name || 'Test Lead';
    entity.cpf = overrides?.cpf || '12345678901';
    entity.status = overrides?.status || LeadStatus.NEW;
    entity.comments = overrides?.comments !== undefined ? overrides.comments : 'Test comments';
    entity.municipality = overrides?.municipality || 'Uberaba';
    entity.createdAt = overrides?.createdAt || new Date();
    entity.updatedAt = overrides?.updatedAt || new Date();
    entity.properties = overrides?.properties || [];
    return entity;
  }

  function createDomainLead(): Lead {
    return new Lead({
      id: 'uuid-123',
      name: 'Test Lead',
      cpf: '12345678901',
      status: LeadStatus.NEW,
      comments: 'Test comments',
      municipality: 'Uberaba',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
});
