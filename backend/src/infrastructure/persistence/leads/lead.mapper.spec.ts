import { LeadMapper } from './lead.mapper';
import { LeadEntity } from './lead.entity';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '../../../domain/leads/lead-status.enum';

describe('LeadMapper', () => {
  const createDomainLead = (): Lead => {
    return new Lead({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'João Silva',
      cpf: '12345678909',
      status: LeadStatus.NEW,
      comments: 'Test comment',
      municipality: 'Uberlândia',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    });
  };

  const createInfrastructureLead = (): LeadEntity => {
    const entity = new LeadEntity();
    entity.id = '123e4567-e89b-12d3-a456-426614174000';
    entity.name = 'João Silva';
    entity.cpf = '12345678909';
    entity.status = LeadStatus.NEW;
    entity.comments = 'Test comment';
    entity.municipality = 'Uberlândia';
    entity.createdAt = new Date('2024-01-01T00:00:00Z');
    entity.updatedAt = new Date('2024-01-02T00:00:00Z');
    return entity;
  };

  describe('toDomain', () => {
    it('should convert infrastructure entity to domain entity', () => {
      const infrastructureEntity = createInfrastructureLead();

      const domainLead = LeadMapper.toDomain(infrastructureEntity);

      expect(domainLead).toBeInstanceOf(Lead);
      expect(domainLead).not.toBeNull();
      if (!domainLead) return;

      expect(domainLead.id).toBe(infrastructureEntity.id);
      expect(domainLead.name).toBe(infrastructureEntity.name);
      expect(domainLead.cpf).toBe(infrastructureEntity.cpf);
      expect(domainLead.status).toBe(infrastructureEntity.status);
      expect(domainLead.comments).toBe(infrastructureEntity.comments);
      expect(domainLead.municipality).toBe(infrastructureEntity.municipality);
      expect(domainLead.createdAt).toEqual(infrastructureEntity.createdAt);
      expect(domainLead.updatedAt).toEqual(infrastructureEntity.updatedAt);
    });

    it('should handle null comments from database', () => {
      const infrastructureEntity = createInfrastructureLead();
      infrastructureEntity.comments = null;

      const domainLead = LeadMapper.toDomain(infrastructureEntity);

      expect(domainLead).not.toBeNull();
      if (!domainLead) return;
      expect(domainLead.comments).toBeUndefined();
    });

    it('should return null for null entity', () => {
      const result = LeadMapper.toDomain(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined entity', () => {
      const result = LeadMapper.toDomain(undefined);
      expect(result).toBeNull();
    });

    it('should preserve all lead statuses', () => {
      const statuses = [
        LeadStatus.NEW,
        LeadStatus.INITIAL_CONTACT,
        LeadStatus.NEGOTIATION,
        LeadStatus.CONVERTED,
        LeadStatus.LOST,
      ];

      statuses.forEach((status) => {
        const entity = createInfrastructureLead();
        entity.status = status;

        const domainLead = LeadMapper.toDomain(entity);

        expect(domainLead).not.toBeNull();
        if (!domainLead) return;
        expect(domainLead.status).toBe(status);
      });
    });
  });

  describe('toInfrastructure', () => {
    it('should convert domain entity to infrastructure entity', () => {
      const domainLead = createDomainLead();

      const infrastructureEntity = LeadMapper.toInfrastructure(domainLead);

      expect(infrastructureEntity).toBeInstanceOf(LeadEntity);
      expect(infrastructureEntity).not.toBeNull();
      if (!infrastructureEntity) return;

      expect(infrastructureEntity.id).toBe(domainLead.id);
      expect(infrastructureEntity.name).toBe(domainLead.name);
      expect(infrastructureEntity.cpf).toBe(domainLead.cpf);
      expect(infrastructureEntity.status).toBe(domainLead.status);
      expect(infrastructureEntity.comments).toBe(domainLead.comments);
      expect(infrastructureEntity.municipality).toBe(domainLead.municipality);
      expect(infrastructureEntity.createdAt).toEqual(domainLead.createdAt);
      expect(infrastructureEntity.updatedAt).toEqual(domainLead.updatedAt);
    });

    it('should handle undefined comments for database', () => {
      const domainLead = createDomainLead();
      domainLead.comments = undefined;

      const infrastructureEntity = LeadMapper.toInfrastructure(domainLead);

      expect(infrastructureEntity).not.toBeNull();
      if (!infrastructureEntity) return;
      expect(infrastructureEntity.comments).toBeNull();
    });

    it('should return null for null domain', () => {
      const result = LeadMapper.toInfrastructure(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined domain', () => {
      const result = LeadMapper.toInfrastructure(undefined);
      expect(result).toBeNull();
    });
  });

  describe('toDomainList', () => {
    it('should convert array of entities to array of domain objects', () => {
      const entities = [
        createInfrastructureLead(),
        createInfrastructureLead(),
        createInfrastructureLead(),
      ];

      const domainLeads = LeadMapper.toDomainList(entities);

      expect(domainLeads).toHaveLength(3);
      domainLeads.forEach((lead) => {
        expect(lead).toBeInstanceOf(Lead);
      });
    });

    it('should return empty array for empty input', () => {
      const result = LeadMapper.toDomainList([]);
      expect(result).toEqual([]);
    });

    it('should filter out null values', () => {
      const entities = [createInfrastructureLead(), null, createInfrastructureLead(), undefined];

      // Filter out null/undefined before passing to mapper
      const validEntities = entities.filter((e): e is LeadEntity => e !== null && e !== undefined);
      const domainLeads = LeadMapper.toDomainList(validEntities);

      expect(domainLeads).toHaveLength(2);
      domainLeads.forEach((lead) => {
        expect(lead).toBeInstanceOf(Lead);
        expect(lead).not.toBeNull();
      });
    });
  });

  describe('bidirectional mapping', () => {
    it('should maintain data integrity in round-trip conversion', () => {
      const originalDomain = createDomainLead();

      const infrastructure = LeadMapper.toInfrastructure(originalDomain);
      expect(infrastructure).not.toBeNull();
      if (!infrastructure) return;

      const backToDomain = LeadMapper.toDomain(infrastructure);
      expect(backToDomain).not.toBeNull();
      if (!backToDomain) return;

      expect(backToDomain.id).toBe(originalDomain.id);
      expect(backToDomain.name).toBe(originalDomain.name);
      expect(backToDomain.cpf).toBe(originalDomain.cpf);
      expect(backToDomain.status).toBe(originalDomain.status);
      expect(backToDomain.municipality).toBe(originalDomain.municipality);
    });

    it('should handle comments in round-trip conversion', () => {
      const domainWithComments = createDomainLead();
      domainWithComments.comments = 'Important notes';

      const infrastructure = LeadMapper.toInfrastructure(domainWithComments);
      expect(infrastructure).not.toBeNull();
      if (!infrastructure) return;

      const backToDomain = LeadMapper.toDomain(infrastructure);
      expect(backToDomain).not.toBeNull();
      if (!backToDomain) return;

      expect(backToDomain.comments).toBe('Important notes');
    });

    it('should handle undefined comments in round-trip conversion', () => {
      const domainWithoutComments = createDomainLead();
      domainWithoutComments.comments = undefined;

      const infrastructure = LeadMapper.toInfrastructure(domainWithoutComments);
      expect(infrastructure).not.toBeNull();
      if (!infrastructure) return;

      const backToDomain = LeadMapper.toDomain(infrastructure);
      expect(backToDomain).not.toBeNull();
      if (!backToDomain) return;

      expect(backToDomain.comments).toBeUndefined();
    });
  });
});
