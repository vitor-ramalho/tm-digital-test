import { Injectable } from '@nestjs/common';
import { CropType } from '@domain/rural-properties/crop-type.enum';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';

export interface CropTypeStatistics {
  cropType: CropType;
  count: number;
  totalArea: number;
}

/**
 * Use case: Get Rural Property Statistics
 * Provides aggregated data for dashboard
 */
@Injectable()
export class GetRuralPropertyStatisticsService {
  constructor(private readonly ruralPropertyRepository: RuralPropertyRepository) {}

  async getCropTypeStatistics(): Promise<CropTypeStatistics[]> {
    return this.ruralPropertyRepository.getCropTypeStatistics();
  }

  async getTotalAreaByLeadId(leadId: string): Promise<number> {
    return this.ruralPropertyRepository.getTotalAreaByLeadId(leadId);
  }

  async getAverageAreaByCropType(cropType: CropType): Promise<number> {
    return this.ruralPropertyRepository.getAverageAreaByCropType(cropType);
  }

  async countByLeadId(leadId: string): Promise<number> {
    return this.ruralPropertyRepository.countByLeadId(leadId);
  }

  async leadHasHighPriorityProperties(leadId: string): Promise<boolean> {
    return this.ruralPropertyRepository.leadHasHighPriorityProperties(leadId);
  }
}
