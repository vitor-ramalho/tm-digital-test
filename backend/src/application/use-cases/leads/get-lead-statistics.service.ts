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

/**
 * Use case: Get Lead Statistics
 * Provides aggregated data for dashboard
 */
@Injectable()
export class GetLeadStatisticsService {
  constructor(private readonly leadRepository: LeadRepository) {}

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
