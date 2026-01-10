import { Module } from '@nestjs/common';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';

// Lead Use Cases
import {
  CreateLeadService,
  UpdateLeadService,
  DeleteLeadService,
  GetLeadService,
  ListLeadsService,
  GetPriorityLeadsService,
  GetLeadStatisticsService,
} from './use-cases/leads';

// Rural Property Use Cases
import {
  CreateRuralPropertyService,
  UpdateRuralPropertyService,
  DeleteRuralPropertyService,
  GetRuralPropertyService,
  ListRuralPropertiesService,
  GetRuralPropertyStatisticsService,
} from './use-cases/rural-properties';

/**
 * Application Layer Module
 * Contains use cases (application services) that orchestrate domain logic
 */
@Module({
  imports: [PersistenceModule],
  providers: [
    // Lead services
    CreateLeadService,
    UpdateLeadService,
    DeleteLeadService,
    GetLeadService,
    ListLeadsService,
    GetPriorityLeadsService,
    GetLeadStatisticsService,
    // Rural Property services
    CreateRuralPropertyService,
    UpdateRuralPropertyService,
    DeleteRuralPropertyService,
    GetRuralPropertyService,
    ListRuralPropertiesService,
    GetRuralPropertyStatisticsService,
  ],
  exports: [
    // Lead services
    CreateLeadService,
    UpdateLeadService,
    DeleteLeadService,
    GetLeadService,
    ListLeadsService,
    GetPriorityLeadsService,
    GetLeadStatisticsService,
    // Rural Property services
    CreateRuralPropertyService,
    UpdateRuralPropertyService,
    DeleteRuralPropertyService,
    GetRuralPropertyService,
    ListRuralPropertiesService,
    GetRuralPropertyStatisticsService,
  ],
})
export class ApplicationModule {}
