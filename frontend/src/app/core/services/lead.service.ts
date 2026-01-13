import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoadingStateService } from './loading-state.service';
import {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  FilterLeadsDto
} from '../models/lead.model';
import { RuralProperty } from '../models/rural-property.model';

/**
 * Lead Service
 * Handles all lead-related API operations
 */
@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private readonly endpoint = '/leads';
  private leadsSubject = new BehaviorSubject<Lead[]>([]);
  public leads$ = this.leadsSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private loadingService: LoadingStateService
  ) {}

  /**
   * Get all leads with optional filters
   */
  getLeads(filters?: FilterLeadsDto): Observable<Lead[]> {
    return this.apiService.get<Lead[]>(this.endpoint, filters).pipe(
      tap(leads => this.leadsSubject.next(leads)),
      map(leads => leads.map(lead => this.parseLeadDates(lead)))
    );
  }

  /**
   * Get a single lead by ID
   */
  getLeadById(id: string): Observable<Lead> {
    return this.apiService.get<Lead>(`${this.endpoint}/${id}`).pipe(
      map(lead => this.parseLeadDates(lead))
    );
  }

  /**
   * Create a new lead
   */
  createLead(dto: CreateLeadDto): Observable<Lead> {
    return this.apiService.post<Lead>(this.endpoint, dto).pipe(
      tap(lead => {
        const currentLeads = this.leadsSubject.value;
        this.leadsSubject.next([...currentLeads, lead]);
      }),
      map(lead => this.parseLeadDates(lead))
    );
  }

  /**
   * Update an existing lead
   */
  updateLead(id: string, dto: UpdateLeadDto): Observable<Lead> {
    return this.apiService.put<Lead>(`${this.endpoint}/${id}`, dto).pipe(
      tap(updatedLead => {
        const currentLeads = this.leadsSubject.value;
        const index = currentLeads.findIndex(l => l.id === id);
        if (index !== -1) {
          currentLeads[index] = updatedLead;
          this.leadsSubject.next([...currentLeads]);
        }
      }),
      map(lead => this.parseLeadDates(lead))
    );
  }

  /**
   * Delete a lead
   */
  deleteLead(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        const currentLeads = this.leadsSubject.value;
        this.leadsSubject.next(currentLeads.filter(l => l.id !== id));
      })
    );
  }

  /**
   * Get properties for a specific lead
   */
  getLeadProperties(leadId: string): Observable<RuralProperty[]> {
    return this.apiService.get<RuralProperty[]>(`${this.endpoint}/${leadId}/properties`);
  }

  /**
   * Get high priority leads (with properties > 100 hectares)
   */
  getHighPriorityLeads(): Observable<Lead[]> {
    return this.getLeads({ isHighPriority: true });
  }

  /**
   * Get leads by municipality
   */
  getLeadsByMunicipality(municipality: string): Observable<Lead[]> {
    return this.getLeads({ municipality });
  }

  /**
   * Get leads by status
   */
  getLeadsByStatus(status: string): Observable<Lead[]> {
    return this.getLeads({ status: status as any });
  }

  /**
   * Check if lead is currently loading
   */
  isLoading(operation: string = 'GET'): Observable<boolean> {
    return this.loadingService.isLoading(`${operation}:${this.endpoint}`);
  }

  /**
   * Parse date strings to Date objects
   */
  private parseLeadDates(lead: Lead): Lead {
    return {
      ...lead,
      createdAt: new Date(lead.createdAt),
      updatedAt: new Date(lead.updatedAt)
    };
  }

  /**
   * Clear cached leads
   */
  clearCache(): void {
    this.leadsSubject.next([]);
  }
}
