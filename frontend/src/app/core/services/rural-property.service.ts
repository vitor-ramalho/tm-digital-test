import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoadingStateService } from './loading-state.service';
import {
  RuralProperty,
  CreateRuralPropertyDto,
  UpdateRuralPropertyDto,
  FilterRuralPropertiesDto
} from '../models/rural-property.model';

/**
 * Rural Property Service
 * Handles all rural property-related API operations
 */
@Injectable({
  providedIn: 'root'
})
export class RuralPropertyService {
  private readonly endpoint = '/rural-properties';
  private propertiesSubject = new BehaviorSubject<RuralProperty[]>([]);
  public properties$ = this.propertiesSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private loadingService: LoadingStateService
  ) {}

  /**
   * Get all rural properties with optional filters
   */
  getProperties(filters?: FilterRuralPropertiesDto): Observable<RuralProperty[]> {
    return this.apiService.get<RuralProperty[]>(this.endpoint, filters).pipe(
      tap(properties => this.propertiesSubject.next(properties)),
      map(properties => properties.map(prop => this.parsePropertyDates(prop)))
    );
  }

  /**
   * Get a single property by ID
   */
  getPropertyById(id: string): Observable<RuralProperty> {
    return this.apiService.get<RuralProperty>(`${this.endpoint}/${id}`).pipe(
      map(property => this.parsePropertyDates(property))
    );
  }

  /**
   * Create a new rural property
   */
  createProperty(dto: CreateRuralPropertyDto): Observable<RuralProperty> {
    return this.apiService.post<RuralProperty>(this.endpoint, dto).pipe(
      tap(property => {
        const currentProperties = this.propertiesSubject.value;
        this.propertiesSubject.next([...currentProperties, property]);
      }),
      map(property => this.parsePropertyDates(property))
    );
  }

  /**
   * Update an existing rural property
   */
  updateProperty(id: string, dto: UpdateRuralPropertyDto): Observable<RuralProperty> {
    return this.apiService.put<RuralProperty>(`${this.endpoint}/${id}`, dto).pipe(
      tap(updatedProperty => {
        const currentProperties = this.propertiesSubject.value;
        const index = currentProperties.findIndex(p => p.id === id);
        if (index !== -1) {
          currentProperties[index] = updatedProperty;
          this.propertiesSubject.next([...currentProperties]);
        }
      }),
      map(property => this.parsePropertyDates(property))
    );
  }

  /**
   * Delete a rural property
   */
  deleteProperty(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        const currentProperties = this.propertiesSubject.value;
        this.propertiesSubject.next(currentProperties.filter(p => p.id !== id));
      })
    );
  }

  /**
   * Get properties by lead ID
   */
  getPropertiesByLeadId(leadId: string): Observable<RuralProperty[]> {
    return this.getProperties({ leadId });
  }

  /**
   * Get high priority properties (> 100 hectares)
   */
  getHighPriorityProperties(): Observable<RuralProperty[]> {
    return this.getProperties({ isHighPriority: true });
  }

  /**
   * Get properties by crop type
   */
  getPropertiesByCropType(cropType: string): Observable<RuralProperty[]> {
    return this.getProperties({ cropType: cropType as any });
  }

  /**
   * Get properties within area range
   */
  getPropertiesByAreaRange(minArea: number, maxArea: number): Observable<RuralProperty[]> {
    return this.getProperties({ minArea, maxArea });
  }

  /**
   * Calculate total area for properties
   */
  calculateTotalArea(properties: RuralProperty[]): number {
    return properties.reduce((total, prop) => total + prop.areaHectares, 0);
  }

  /**
   * Calculate average area for properties
   */
  calculateAverageArea(properties: RuralProperty[]): number {
    if (properties.length === 0) return 0;
    return this.calculateTotalArea(properties) / properties.length;
  }

  /**
   * Check if property is currently loading
   */
  isLoading(operation: string = 'GET'): Observable<boolean> {
    return this.loadingService.isLoading(`${operation}:${this.endpoint}`);
  }

  /**
   * Parse date strings to Date objects
   */
  private parsePropertyDates(property: RuralProperty): RuralProperty {
    return {
      ...property,
      createdAt: new Date(property.createdAt),
      updatedAt: new Date(property.updatedAt)
    };
  }

  /**
   * Clear cached properties
   */
  clearCache(): void {
    this.propertiesSubject.next([]);
  }
}
