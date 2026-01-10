import { Injectable } from '@nestjs/common';
import { LeadStatus } from '@domain/leads/lead-status.enum';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';

export interface StatusStatistics {
  status: LeadStatus;
  count: number;
}

export interface MunicipalityStatistics {
  municipality: string;
  count: number;
}

export interface LeadStatistics {
  total: number;
  byStatus: Record<string, number>;
  byMunicipality: Record<string, number>;
}

/**
 * Use case: Get Lead Statistics
 * Provides aggregated data for dashboard
 */
@Injectable()
export class GetLeadStatisticsService {
  constructor(private readonly leadRepository: LeadRepository) {}

  /**
   * Get comprehensive statistics for leads
   */
  async execute(): Promise<LeadStatistics> {
    const statusStats = await this.leadRepository.getStatusStatistics();
    const municipalityStats = await this.leadRepository.getMunicipalityStatistics();
    const allLeads = await this.leadRepository.findAll({});

    const byStatus: Record<string, number> = {};
    statusStats.forEach((stat) => {
      byStatus[stat.status] = stat.count;
    });

    const byMunicipality: Record<string, number> = {};
    municipalityStats.forEach((stat) => {
      byMunicipality[stat.municipality] = stat.count;
    });

    return {
      total: allLeads.length,
      byStatus,
      byMunicipality,
    };
  }

  async getStatusStatistics(): Promise<StatusStatistics[]> {
    return this.leadRepository.getStatusStatistics();
  }

  async getMunicipalityStatistics(): Promise<MunicipalityStatistics[]> {
    return this.leadRepository.getMunicipalityStatistics();
  }

  async countByStatus(status: LeadStatus): Promise<number> {
    return this.leadRepository.countByStatus(status);
  }

  async countByMunicipality(municipality: string): Promise<number> {
    return this.leadRepository.countByMunicipality(municipality);
  }
}
