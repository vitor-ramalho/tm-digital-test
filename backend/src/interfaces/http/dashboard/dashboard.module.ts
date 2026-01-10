import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { GetDashboardStatisticsService } from '@application/use-cases/dashboard/get-dashboard-statistics.service';
import { GetLeadStatisticsService } from '@application/use-cases/leads/get-lead-statistics.service';
import { GetRuralPropertyStatisticsService } from '@application/use-cases/rural-properties/get-rural-property-statistics.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { LeadEntity } from '@infrastructure/persistence/leads/lead.entity';
import { RuralPropertyEntity } from '@infrastructure/persistence/rural-properties/rural-property.entity';

/**
 * Dashboard Module
 * Provides aggregated statistics for the dashboard view
 * All queries are optimized using TypeORM query builder
 */
@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity, RuralPropertyEntity])],
  controllers: [DashboardController],
  providers: [
    // Application Services (Use Cases)
    GetDashboardStatisticsService,
    GetLeadStatisticsService,
    GetRuralPropertyStatisticsService,
    // Infrastructure Repositories
    LeadRepository,
    RuralPropertyRepository,
  ],
  exports: [GetDashboardStatisticsService],
})
export class DashboardModule {}
