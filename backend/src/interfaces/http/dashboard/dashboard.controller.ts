import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { GetDashboardStatisticsService } from '@application/use-cases/dashboard/get-dashboard-statistics.service';
import { GetLeadStatisticsService } from '@application/use-cases/leads/get-lead-statistics.service';
import { GetRuralPropertyStatisticsService } from '@application/use-cases/rural-properties/get-rural-property-statistics.service';

/**
 * REST Controller for Dashboard
 * Provides aggregated statistics and insights for the dashboard view
 * All endpoints use optimized PostgreSQL queries via TypeORM query builder
 *
 * Routes:
 * - GET /dashboard - Complete dashboard statistics
 * - GET /dashboard/leads - Lead-specific statistics
 * - GET /dashboard/properties - Property-specific statistics
 * - GET /dashboard/leads/by-status - Leads grouped by status
 * - GET /dashboard/leads/by-municipality - Leads grouped by municipality
 */
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardStatisticsService: GetDashboardStatisticsService,
    private readonly getLeadStatisticsService: GetLeadStatisticsService,
    private readonly getRuralPropertyStatisticsService: GetRuralPropertyStatisticsService,
  ) {}

  /**
   * GET /dashboard
   * Get comprehensive dashboard statistics
   * Includes leads, properties, and insights
   * Optimized: All queries executed in parallel
   * @returns Complete dashboard data
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getDashboard() {
    return this.getDashboardStatisticsService.execute();
  }

  /**
   * GET /dashboard/leads
   * Get lead-specific statistics
   * Uses optimized PostgreSQL GROUP BY queries
   * @returns Total, grouped by status, grouped by municipality
   */
  @Get('leads')
  @HttpCode(HttpStatus.OK)
  async getLeadStatistics() {
    return this.getLeadStatisticsService.execute();
  }

  /**
   * GET /dashboard/properties
   * Get rural property statistics
   * Uses optimized PostgreSQL aggregation queries
   * @returns Total, area statistics, grouped by crop type
   */
  @Get('properties')
  @HttpCode(HttpStatus.OK)
  async getPropertyStatistics() {
    return this.getRuralPropertyStatisticsService.execute();
  }

  /**
   * GET /dashboard/leads/by-status
   * Get leads grouped by status
   * Optimized query: SELECT status, COUNT(*) GROUP BY status
   * @returns Array of status with counts
   */
  @Get('leads/by-status')
  @HttpCode(HttpStatus.OK)
  async getLeadsByStatus() {
    const stats = await this.getLeadStatisticsService.getStatusStatistics();
    return stats;
  }

  /**
   * GET /dashboard/leads/by-municipality
   * Get leads grouped by municipality
   * Optimized query: SELECT municipality, COUNT(*) GROUP BY municipality ORDER BY count DESC
   * @returns Array of municipalities with counts, ordered by count descending
   */
  @Get('leads/by-municipality')
  @HttpCode(HttpStatus.OK)
  async getLeadsByMunicipality() {
    const stats = await this.getLeadStatisticsService.getMunicipalityStatistics();
    return stats;
  }
}
