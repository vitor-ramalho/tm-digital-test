import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  DashboardStatistics,
  LeadsByStatus,
  LeadsByMunicipality,
  PriorityLead,
  DashboardResponse
} from '../../../core/models/dashboard.model';
import { Lead } from '../../../core/models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService) { }

  /**
   * Get complete dashboard statistics
   * Route: GET /dashboard
   * Maps the backend response to the legacy DashboardStatistics format
   */
  getStatistics(): Observable<DashboardStatistics> {
    return this.apiService.get<DashboardResponse>('/dashboard').pipe(
      map(response => ({
        totalLeads: response.leads.total,
        newLeads: response.leads.byStatus['NEW'] || 0,
        leadsInNegotiation: response.leads.byStatus['NEGOTIATION'] || 0,
        convertedLeads: response.leads.byStatus['CONVERTED'] || 0,
        lostLeads: response.leads.byStatus['LOST'] || 0,
        priorityLeads: response.leads.highPriority
      }))
    );
  }

  /**
   * Get leads grouped by status
   * Route: GET /dashboard/leads/by-status
   */
  getLeadsByStatus(): Observable<LeadsByStatus[]> {
    return this.apiService.get<LeadsByStatus[]>('/dashboard/leads/by-status');
  }

  /**
   * Get leads grouped by municipality
   * Route: GET /dashboard/leads/by-municipality
   */
  getLeadsByMunicipality(): Observable<LeadsByMunicipality[]> {
    return this.apiService.get<LeadsByMunicipality[]>('/dashboard/leads/by-municipality');
  }

  /**
   * Get high-priority leads (with properties > 100ha)
   * Route: GET /leads/priority
   * Maps Lead entities to PriorityLead format
   */
  getPriorityLeads(): Observable<PriorityLead[]> {
    return this.apiService.get<Lead[]>('/leads/priority').pipe(
      map(leads => leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        cpf: lead.cpf,
        municipality: lead.municipality,
        status: lead.status,
        totalArea: 0, // Will be calculated if properties are included
        propertyCount: 0, // Will be calculated if properties are included
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt
      })))
    );
  }
}
