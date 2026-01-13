import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeadService } from './lead.service';
import { ApiService } from './api.service';
import { LoadingStateService } from './loading-state.service';
import { Lead, LeadStatus, CreateLeadDto, UpdateLeadDto } from '../models/lead.model';

describe('LeadService', () => {
  let service: LeadService;
  let httpMock: HttpTestingController;
  let apiService: ApiService;
  let loadingService: LoadingStateService;

  const mockLead: Lead = {
    id: '1',
    name: 'João Silva',
    cpf: '12345678900',
    status: LeadStatus.NEW,
    municipality: 'Uberaba',
    comments: 'Test comment',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isHighPriority: false,
    propertiesCount: 0
  };

  const mockLeads: Lead[] = [mockLead];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LeadService,
        ApiService,
        LoadingStateService
      ]
    });

    service = TestBed.inject(LeadService);
    httpMock = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);
    loadingService = TestBed.inject(LoadingStateService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getLeads', () => {
    it('should fetch all leads', (done) => {
      service.getLeads().subscribe({
        next: (leads) => {
          expect(leads.length).toBe(1);
          expect(leads[0].name).toBe('João Silva');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/leads');
      expect(req.request.method).toBe('GET');
      req.flush(mockLeads);
    });

    it('should fetch leads with filters', (done) => {
      const filters = { status: LeadStatus.NEW, municipality: 'Uberaba' };

      service.getLeads(filters).subscribe({
        next: (leads) => {
          expect(leads.length).toBe(1);
          done();
        }
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/leads') &&
        request.params.has('status') &&
        request.params.has('municipality')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('status')).toBe(LeadStatus.NEW);
      expect(req.request.params.get('municipality')).toBe('Uberaba');
      req.flush(mockLeads);
    });

    it('should update leads$ observable', (done) => {
      service.leads$.subscribe((leads) => {
        if (leads.length > 0) {
          expect(leads[0].name).toBe('João Silva');
          done();
        }
      });

      service.getLeads().subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/leads');
      req.flush(mockLeads);
    });
  });

  describe('getLeadById', () => {
    it('should fetch a single lead', (done) => {
      service.getLeadById('1').subscribe({
        next: (lead) => {
          expect(lead.id).toBe('1');
          expect(lead.name).toBe('João Silva');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/leads/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockLead);
    });
  });

  describe('createLead', () => {
    it('should create a new lead', (done) => {
      const createDto: CreateLeadDto = {
        name: 'João Silva',
        cpf: '12345678900',
        municipality: 'Uberaba',
        status: LeadStatus.NEW
      };

      service.createLead(createDto).subscribe({
        next: (lead) => {
          expect(lead.name).toBe(createDto.name);
          expect(lead.cpf).toBe(createDto.cpf);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/leads');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockLead);
    });

    it('should add new lead to leads$ observable', (done) => {
      const createDto: CreateLeadDto = {
        name: 'João Silva',
        cpf: '12345678900',
        municipality: 'Uberaba',
        status: LeadStatus.NEW
      };

      // First populate with existing leads
      service.getLeads().subscribe();
      let req = httpMock.expectOne('http://localhost:3000/api/leads');
      req.flush([]);

      // Then create new lead
      service.createLead(createDto).subscribe();
      req = httpMock.expectOne('http://localhost:3000/api/leads');
      req.flush(mockLead);

      // Check if leads$ was updated
      service.leads$.subscribe((leads) => {
        if (leads.length > 0) {
          expect(leads[0].name).toBe('João Silva');
          done();
        }
      });
    });
  });

  describe('updateLead', () => {
    it('should update an existing lead', (done) => {
      const updateDto: UpdateLeadDto = {
        status: LeadStatus.NEGOTIATION,
        comments: 'Updated comment'
      };

      const updatedLead = { ...mockLead, ...updateDto };

      service.updateLead('1', updateDto).subscribe({
        next: (lead) => {
          expect(lead.status).toBe(LeadStatus.NEGOTIATION);
          expect(lead.comments).toBe('Updated comment');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/leads/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush(updatedLead);
    });

    it('should update lead in leads$ observable', (done) => {
      // First populate with existing leads
      service.getLeads().subscribe();
      let req = httpMock.expectOne('http://localhost:3000/api/leads');
      req.flush([mockLead]);

      // Then update lead
      const updateDto: UpdateLeadDto = { status: LeadStatus.NEGOTIATION };
      const updatedLead = { ...mockLead, status: LeadStatus.NEGOTIATION };

      service.updateLead('1', updateDto).subscribe();
      req = httpMock.expectOne('http://localhost:3000/api/leads/1');
      req.flush(updatedLead);

      // Check if leads$ was updated
      service.leads$.subscribe((leads) => {
        if (leads.length > 0 && leads[0].status === LeadStatus.NEGOTIATION) {
          expect(leads[0].status).toBe(LeadStatus.NEGOTIATION);
          done();
        }
      });
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead', (done) => {
      service.deleteLead('1').subscribe({
        next: () => {
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/leads/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should remove lead from leads$ observable', (done) => {
      // First populate with existing leads
      service.getLeads().subscribe();
      let req = httpMock.expectOne('http://localhost:3000/api/leads');
      req.flush([mockLead]);

      // Then delete lead
      service.deleteLead('1').subscribe();
      req = httpMock.expectOne('http://localhost:3000/api/leads/1');
      req.flush(null);

      // Check if leads$ was updated
      service.leads$.subscribe((leads) => {
        if (leads.length === 0) {
          expect(leads.length).toBe(0);
          done();
        }
      });
    });
  });

  describe('getLeadProperties', () => {
    it('should fetch properties for a lead', (done) => {
      const mockProperties = [
        {
          id: '1',
          leadId: '1',
          cropType: 'SOY',
          areaHectares: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          isHighPriority: false,
          sizeClassification: 'MEDIUM' as const
        }
      ];

      service.getLeadProperties('1').subscribe({
        next: (properties) => {
          expect(properties.length).toBe(1);
          expect(properties[0].leadId).toBe('1');
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/leads/1/properties');
      expect(req.request.method).toBe('GET');
      req.flush(mockProperties);
    });
  });

  describe('getHighPriorityLeads', () => {
    it('should fetch high priority leads', (done) => {
      service.getHighPriorityLeads().subscribe({
        next: (leads) => {
          expect(leads.length).toBeGreaterThanOrEqual(0);
          done();
        }
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/leads') &&
        request.params.get('isHighPriority') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush([{ ...mockLead, isHighPriority: true }]);
    });
  });

  describe('getLeadsByMunicipality', () => {
    it('should fetch leads by municipality', (done) => {
      service.getLeadsByMunicipality('Uberaba').subscribe({
        next: (leads) => {
          expect(leads.length).toBe(1);
          expect(leads[0].municipality).toBe('Uberaba');
          done();
        }
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/leads') &&
        request.params.get('municipality') === 'Uberaba'
      );
      req.flush(mockLeads);
    });
  });

  describe('getLeadsByStatus', () => {
    it('should fetch leads by status', (done) => {
      service.getLeadsByStatus(LeadStatus.NEW).subscribe({
        next: (leads) => {
          expect(leads.length).toBe(1);
          expect(leads[0].status).toBe(LeadStatus.NEW);
          done();
        }
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/leads') &&
        request.params.get('status') === LeadStatus.NEW
      );
      req.flush(mockLeads);
    });
  });

  describe('isLoading', () => {
    it('should return loading state', (done) => {
      // Mock loading state
      loadingService.setLoading('GET:/leads', true);

      service.isLoading('GET').subscribe({
        next: (loading) => {
          expect(loading).toBe(true);
          done();
        }
      });
    });
  });

  describe('clearCache', () => {
    it('should clear cached leads', (done) => {
      // First populate cache
      service.getLeads().subscribe();
      let req = httpMock.expectOne('http://localhost:3000/api/leads');
      req.flush([mockLead]);

      // Clear cache
      service.clearCache();

      // Verify cache is empty
      service.leads$.subscribe((leads) => {
        if (leads.length === 0) {
          expect(leads.length).toBe(0);
          done();
        }
      });
    });
  });

  describe('date parsing', () => {
    it('should parse date strings to Date objects', (done) => {
      const leadWithStringDates = {
        ...mockLead,
        createdAt: '2025-01-01T00:00:00.000Z' as any,
        updatedAt: '2025-01-01T00:00:00.000Z' as any
      };

      service.getLeadById('1').subscribe({
        next: (lead) => {
          expect(lead.createdAt instanceof Date).toBe(true);
          expect(lead.updatedAt instanceof Date).toBe(true);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/leads/1');
      req.flush(leadWithStringDates);
    });
  });
});
