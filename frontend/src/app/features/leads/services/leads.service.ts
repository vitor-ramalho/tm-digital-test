import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  LeadStatistics
} from '../../../core/models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private readonly endpoint = '/leads';

  constructor(private api: ApiService) {}

  /**
   * Get all leads with optional filters
   */
  getLeads(filters?: {
    status?: string;
    municipality?: string;
    priority?: boolean;
  }): Observable<Lead[]> {
    return this.api.get<Lead[]>(this.endpoint, filters);
  }

  /**
   * Get priority leads (area > 100 hectares)
   */
  getPriorityLeads(): Observable<Lead[]> {
    return this.api.get<Lead[]>(`${this.endpoint}/priority`);
  }

  /**
   * Get lead statistics
   */
  getStatistics(): Observable<LeadStatistics> {
    return this.api.get<LeadStatistics>(`${this.endpoint}/statistics`);
  }

  /**
   * Get lead by ID
   */
  getLead(id: string): Observable<Lead> {
    return this.api.get<Lead>(`${this.endpoint}/${id}`);
  }

  /**
   * Create new lead
   */
  createLead(lead: CreateLeadDto): Observable<Lead> {
    return this.api.post<Lead>(this.endpoint, lead);
  }

  /**
   * Update existing lead
   */
  updateLead(id: string, lead: UpdateLeadDto): Observable<Lead> {
    return this.api.put<Lead>(`${this.endpoint}/${id}`, lead);
  }

  /**
   * Delete lead
   */
  deleteLead(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
