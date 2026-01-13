import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoadingStateService } from './loading-state.service';
import {
  DashboardResponse,
  LeadStatistics,
  PropertyStatistics,
  DashboardInsights,
  LeadsByStatus,
  LeadsByMunicipality,
  CropTypeStatistics
} from '../models/dashboard.model';

/**
 * Dashboard Service
 * Handles all dashboard-related API operations with optimized queries
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly endpoint = '/dashboard';
  private dashboardSubject = new BehaviorSubject<DashboardResponse | null>(null);
  public dashboard$ = this.dashboardSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private loadingService: LoadingStateService
  ) {}

  /**
   * Get complete dashboard statistics
   * Returns all statistics in a single optimized call
   */
  getDashboard(): Observable<DashboardResponse> {
    return this.apiService.get<DashboardResponse>(this.endpoint).pipe(
      tap(dashboard => this.dashboardSubject.next(dashboard))
    );
  }

  /**
   * Get lead statistics only
   */
  getLeadStatistics(): Observable<LeadStatistics> {
    return this.apiService.get<LeadStatistics>(`${this.endpoint}/leads`);
  }

  /**
   * Get property statistics only
   */
  getPropertyStatistics(): Observable<PropertyStatistics> {
    return this.apiService.get<PropertyStatistics>(`${this.endpoint}/properties`);
  }

  /**
   * Get leads grouped by status
   */
  getLeadsByStatus(): Observable<LeadsByStatus[]> {
    return this.apiService.get<LeadsByStatus[]>(`${this.endpoint}/leads/by-status`);
  }

  /**
   * Get leads grouped by municipality
   */
  getLeadsByMunicipality(): Observable<LeadsByMunicipality[]> {
    return this.apiService.get<LeadsByMunicipality[]>(`${this.endpoint}/leads/by-municipality`);
  }

  /**
   * Get properties grouped by crop type
   */
  getPropertiesByCropType(): Observable<CropTypeStatistics[]> {
    return this.apiService.get<CropTypeStatistics[]>(`${this.endpoint}/properties/by-crop-type`);
  }

  /**
   * Get insights and KPIs
   */
  getInsights(): Observable<DashboardInsights> {
    return this.apiService.get<DashboardInsights>(`${this.endpoint}/insights`);
  }

  /**
   * Check if dashboard is currently loading
   */
  isLoading(): Observable<boolean> {
    return this.loadingService.isLoading(`GET:${this.endpoint}`);
  }

  /**
   * Refresh dashboard data
   */
  refresh(): Observable<DashboardResponse> {
    return this.getDashboard();
  }

  /**
   * Clear cached dashboard data
   */
  clearCache(): void {
    this.dashboardSubject.next(null);
  }

  /**
   * Get current dashboard snapshot
   */
  getCurrentDashboard(): DashboardResponse | null {
    return this.dashboardSubject.value;
  }
}
