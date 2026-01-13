import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { RuralProperty, CropType } from '../../../core/models/rural-property.model';

export interface PropertyFilters {
  leadId?: string;
  cropType?: CropType;
}

@Injectable({
  providedIn: 'root'
})
export class RuralPropertiesService {
  private readonly endpoint = '/rural-properties';

  constructor(private apiService: ApiService) {}

  getProperties(filters?: PropertyFilters): Observable<RuralProperty[]> {
    return this.apiService.get<RuralProperty[]>(this.endpoint, filters);
  }

  getPropertiesByLead(leadId: string): Observable<RuralProperty[]> {
    return this.apiService.get<RuralProperty[]>(`/leads/${leadId}/properties`);
  }

  getProperty(id: string): Observable<RuralProperty> {
    return this.apiService.get<RuralProperty>(`${this.endpoint}/${id}`);
  }

  createProperty(data: Partial<RuralProperty>): Observable<RuralProperty> {
    return this.apiService.post<RuralProperty>(this.endpoint, data);
  }

  updateProperty(id: string, data: Partial<RuralProperty>): Observable<RuralProperty> {
    return this.apiService.put<RuralProperty>(`${this.endpoint}/${id}`, data);
  }

  deleteProperty(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
