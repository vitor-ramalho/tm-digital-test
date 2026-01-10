import { Injectable } from '@nestjs/common';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';

export interface DashboardStatistics {
  leads: {
    total: number;
    byStatus: Record<string, number>;
    byMunicipality: Record<string, number>;
    highPriority: number;
  };
  properties: {
    total: number;
    totalArea: number;
    averageArea: number;
    byCropType: Record<string, number>;
    highPriorityCount: number;
  };
  insights: {
    topMunicipality: { name: string; count: number } | null;
    conversionRate: number;
    averagePropertiesPerLead: number;
  };
}

/**
 * Use case: Get Dashboard Statistics
 * Provides comprehensive aggregated data for the dashboard
 * Optimized with PostgreSQL query builder for performance
 */
@Injectable()
export class GetDashboardStatisticsService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly ruralPropertyRepository: RuralPropertyRepository,
  ) {}

  async execute(): Promise<DashboardStatistics> {
    // Execute all queries in parallel for better performance
    const [
      leadStatusStats,
      leadMunicipalityStats,
      allLeads,
      highPriorityLeads,
      allProperties,
      cropTypeStats,
      highPriorityProperties,
    ] = await Promise.all([
      this.leadRepository.getStatusStatistics(),
      this.leadRepository.getMunicipalityStatistics(),
      this.leadRepository.findAll({}),
      this.leadRepository.findHighPriorityLeads(),
      this.ruralPropertyRepository.findAll({}),
      this.ruralPropertyRepository.getCropTypeStatistics(),
      this.ruralPropertyRepository.findAll({ highPriorityOnly: true }),
    ]);

    // Process lead statistics
    const byStatus: Record<string, number> = {};
    leadStatusStats.forEach((stat) => {
      byStatus[stat.status] = stat.count;
    });

    const byMunicipality: Record<string, number> = {};
    leadMunicipalityStats.forEach((stat) => {
      byMunicipality[stat.municipality] = stat.count;
    });

    // Process property statistics
    const totalArea = allProperties.reduce((sum, prop) => sum + prop.areaHectares, 0);
    const averageArea = allProperties.length > 0 ? totalArea / allProperties.length : 0;

    const byCropType: Record<string, number> = {};
    cropTypeStats.forEach((stat) => {
      byCropType[stat.cropType] = stat.count;
    });

    // Calculate insights
    const topMunicipality =
      leadMunicipalityStats.length > 0
        ? { name: leadMunicipalityStats[0].municipality, count: leadMunicipalityStats[0].count }
        : null;

    const convertedCount = byStatus['CONVERTED'] || 0;
    const totalLeads = allLeads.length;
    const conversionRate = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;

    const averagePropertiesPerLead = totalLeads > 0 ? allProperties.length / totalLeads : 0;

    return {
      leads: {
        total: totalLeads,
        byStatus,
        byMunicipality,
        highPriority: highPriorityLeads.length,
      },
      properties: {
        total: allProperties.length,
        totalArea: Math.round(totalArea * 100) / 100,
        averageArea: Math.round(averageArea * 100) / 100,
        byCropType,
        highPriorityCount: highPriorityProperties.length,
      },
      insights: {
        topMunicipality,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averagePropertiesPerLead: Math.round(averagePropertiesPerLead * 100) / 100,
      },
    };
  }
}
