import { Lead } from './lead.entity';
import { LeadStatus } from './lead-status.enum';

describe('Lead Entity', () => {
  const createLead = (status: LeadStatus = LeadStatus.NEW): Lead => {
    return new Lead({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'João Silva',
      cpf: '12345678909',
      status,
      municipality: 'Uberlândia',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  };

  describe('constructor', () => {
    it('should create a lead with all required fields', () => {
      const lead = createLead();

      expect(lead.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(lead.name).toBe('João Silva');
      expect(lead.cpf).toBe('12345678909');
      expect(lead.status).toBe(LeadStatus.NEW);
      expect(lead.municipality).toBe('Uberlândia');
    });

    it('should create a lead with optional comments', () => {
      const lead = new Lead({
        id: '1',
        name: 'Maria Santos',
        cpf: '98765432100',
        status: LeadStatus.NEW,
        municipality: 'Belo Horizonte',
        comments: 'Interested in soy fertilizers',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(lead.comments).toBe('Interested in soy fertilizers');
    });
  });

  describe('isActive', () => {
    it('should return true for NEW status', () => {
      const lead = createLead(LeadStatus.NEW);
      expect(lead.isActive()).toBe(true);
    });

    it('should return true for INITIAL_CONTACT status', () => {
      const lead = createLead(LeadStatus.INITIAL_CONTACT);
      expect(lead.isActive()).toBe(true);
    });

    it('should return true for NEGOTIATION status', () => {
      const lead = createLead(LeadStatus.NEGOTIATION);
      expect(lead.isActive()).toBe(true);
    });

    it('should return false for CONVERTED status', () => {
      const lead = createLead(LeadStatus.CONVERTED);
      expect(lead.isActive()).toBe(false);
    });

    it('should return false for LOST status', () => {
      const lead = createLead(LeadStatus.LOST);
      expect(lead.isActive()).toBe(false);
    });
  });

  describe('canBeConverted', () => {
    it('should return false for NEW status', () => {
      const lead = createLead(LeadStatus.NEW);
      expect(lead.canBeConverted()).toBe(false);
    });

    it('should return false for INITIAL_CONTACT status', () => {
      const lead = createLead(LeadStatus.INITIAL_CONTACT);
      expect(lead.canBeConverted()).toBe(false);
    });

    it('should return true for NEGOTIATION status', () => {
      const lead = createLead(LeadStatus.NEGOTIATION);
      expect(lead.canBeConverted()).toBe(true);
    });

    it('should return false for CONVERTED status', () => {
      const lead = createLead(LeadStatus.CONVERTED);
      expect(lead.canBeConverted()).toBe(false);
    });

    it('should return false for LOST status', () => {
      const lead = createLead(LeadStatus.LOST);
      expect(lead.canBeConverted()).toBe(false);
    });
  });

  describe('isValidCpf', () => {
    it('should return true for valid CPF format', () => {
      expect(Lead.isValidCpf('12345678909')).toBe(true);
    });

    it('should return true for formatted CPF', () => {
      expect(Lead.isValidCpf('123.456.789-09')).toBe(true);
    });

    it('should return false for CPF with less than 11 digits', () => {
      expect(Lead.isValidCpf('123456789')).toBe(false);
    });

    it('should return false for CPF with more than 11 digits', () => {
      expect(Lead.isValidCpf('123456789012')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(Lead.isValidCpf('')).toBe(false);
    });
  });

  describe('progressStatus', () => {
    it('should progress from NEW to INITIAL_CONTACT', () => {
      const lead = createLead(LeadStatus.NEW);
      const beforeUpdate = lead.updatedAt;

      lead.progressStatus();

      expect(lead.status).toBe(LeadStatus.INITIAL_CONTACT);
      expect(lead.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });

    it('should progress from INITIAL_CONTACT to NEGOTIATION', () => {
      const lead = createLead(LeadStatus.INITIAL_CONTACT);

      lead.progressStatus();

      expect(lead.status).toBe(LeadStatus.NEGOTIATION);
    });

    it('should progress from NEGOTIATION to CONVERTED', () => {
      const lead = createLead(LeadStatus.NEGOTIATION);

      lead.progressStatus();

      expect(lead.status).toBe(LeadStatus.CONVERTED);
    });

    it('should not change status from CONVERTED', () => {
      const lead = createLead(LeadStatus.CONVERTED);
      const beforeUpdate = lead.updatedAt;

      lead.progressStatus();

      expect(lead.status).toBe(LeadStatus.CONVERTED);
      expect(lead.updatedAt).toBe(beforeUpdate);
    });

    it('should not change status from LOST', () => {
      const lead = createLead(LeadStatus.LOST);
      const beforeUpdate = lead.updatedAt;

      lead.progressStatus();

      expect(lead.status).toBe(LeadStatus.LOST);
      expect(lead.updatedAt).toBe(beforeUpdate);
    });
  });

  describe('status lifecycle', () => {
    it('should follow complete lifecycle from NEW to CONVERTED', () => {
      const lead = createLead(LeadStatus.NEW);

      // NEW -> INITIAL_CONTACT
      lead.progressStatus();
      expect(lead.status).toBe(LeadStatus.INITIAL_CONTACT);
      expect(lead.isActive()).toBe(true);

      // INITIAL_CONTACT -> NEGOTIATION
      lead.progressStatus();
      expect(lead.status).toBe(LeadStatus.NEGOTIATION);
      expect(lead.canBeConverted()).toBe(true);

      // NEGOTIATION -> CONVERTED
      lead.progressStatus();
      expect(lead.status).toBe(LeadStatus.CONVERTED);
      expect(lead.isActive()).toBe(false);
      expect(lead.canBeConverted()).toBe(false);
    });
  });
});
