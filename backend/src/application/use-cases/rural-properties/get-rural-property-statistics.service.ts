import { Injectable } from '@nestjs/common';
import { CropType } from '@domain/rural-properties/crop-type.enum';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';

export interface CropTypeStatistics {
  cropType: CropType;
  count: number;
  totalArea: number;
}

export interface RuralPropertyStatistics {
  total: number;
  totalArea: number;
  averageArea: number;
  byCropType: Record<string, number>;
  highPriorityCount: number;
}

/**
 * Use case: Get Rural Property Statistics
 * Provides aggregated data for dashboard
 */
@Injectable()
export class GetRuralPropertyStatisticsService {
  constructor(private readonly ruralPropertyRepository: RuralPropertyRepository) {}

  /**
   * Get comprehensive statistics for rural properties
   */
  async execute(): Promise<RuralPropertyStatistics> {
    const allProperties = await this.ruralPropertyRepository.findAll({});
    const cropStats = await this.ruralPropertyRepository.getCropTypeStatistics();
    const highPriorityProperties = await this.ruralPropertyRepository.findAll({
      highPriorityOnly: true,
    });

    const totalArea = allProperties.reduce((sum, prop) => sum + prop.areaHectares, 0);
    const averageArea = allProperties.length > 0 ? totalArea / allProperties.length : 0;

    const byCropType: Record<string, number> = {};
    cropStats.forEach((stat) => {
      byCropType[stat.cropType] = stat.count;
    });

    return {
      total: allProperties.length,
      totalArea: Math.round(totalArea * 100) / 100,
      averageArea: Math.round(averageArea * 100) / 100,
      byCropType,
      highPriorityCount: highPriorityProperties.length,
    };
  }

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
