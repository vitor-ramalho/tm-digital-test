import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { CreateLeadService } from '@application/use-cases/leads/create-lead.service';
import { UpdateLeadService } from '@application/use-cases/leads/update-lead.service';
import { DeleteLeadService } from '@application/use-cases/leads/delete-lead.service';
import { GetLeadService } from '@application/use-cases/leads/get-lead.service';
import { ListLeadsService } from '@application/use-cases/leads/list-leads.service';
import { GetPriorityLeadsService } from '@application/use-cases/leads/get-priority-leads.service';
import { GetLeadStatisticsService } from '@application/use-cases/leads/get-lead-statistics.service';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { LeadEntity } from '@infrastructure/persistence/leads/lead.entity';
import { RuralPropertyEntity } from '@infrastructure/persistence/rural-properties/rural-property.entity';

/**
 * Leads Module
 * Provides all dependencies for lead management
 */
@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity, RuralPropertyEntity])],
  controllers: [LeadsController],
  providers: [
    // Application Services (Use Cases)
    CreateLeadService,
    UpdateLeadService,
    DeleteLeadService,
    GetLeadService,
    ListLeadsService,
    GetPriorityLeadsService,
    GetLeadStatisticsService,
    // Infrastructure Repositories
    LeadRepository,
    RuralPropertyRepository,
  ],
  exports: [
    CreateLeadService,
    UpdateLeadService,
    DeleteLeadService,
    GetLeadService,
    ListLeadsService,
    GetPriorityLeadsService,
    GetLeadStatisticsService,
  ],
})
export class LeadsModule {}
